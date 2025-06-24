from datetime import datetime, timezone, timedelta
import traceback
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Session
from app.models.usuarios import Usuario, PasswordLog, UsuarioLog
from app.models.dispositivos_confiable import DispositivoConfiable
from app.models.rol import RolUsuario, Rol, RolPermiso
from app.services.rol import get_rol_por_nombre
from app.utils.jwt import (
    crear_token_acceso,
    crear_token_refresh,
    generar_token_reset,
    crear_token_refresh,
)
from app.schemas.usuarios_schema import (
    LoginSchema,
    UsuarioInputSchema,
    UsuarioOutputSchema,
    ResetPasswordSchema,
    RecuperarPasswordSchema,
)
from marshmallow import ValidationError
from app.services.servicio_base import ServicioBase
from app.models.permisos import Permiso
from app.models.otp_reset_password_model import OtpResetPassword
from app.utils.email import (
    generar_codigo_otp,
    enviar_codigo_por_email,
    enviar_codigo_por_email_registro,
    decodificar_token_verificacion,
    enviar_email_validacion_dispositivo,
)
from jwt import ExpiredSignatureError, InvalidTokenError
from app.utils.response import ResponseStatus
from app.utils.otp_manager import (
    guardar_otp,
    verificar_otp_redis,
    guardar_token_recuperacion,
    verificar_token_recuperacion,
    guardar_datos_registro_temporal,
    obtener_datos_registro_temporal,
)
from flask_jwt_extended import decode_token
from app.extensions import get_redis


class UsuarioService(ServicioBase):
    def __init__(self):
        super().__init__(model=Usuario, schema=UsuarioInputSchema())
        self.schema_out = UsuarioOutputSchema()
        self.schema_recuperar = RecuperarPasswordSchema()
        self.schema_reset = ResetPasswordSchema()
        self.schema_login = LoginSchema()

    # -----------------------------------------------------------------------------------------------------------------------------
    # REGISTRO Y VERIFICACIÓN
    # -----------------------------------------------------------------------------------------------------------------------------

    def iniciar_registro(self, session: Session, data: dict) -> tuple:
        try:
            data_validada = self.schema.load(data)
        except ValidationError as e:
            return ResponseStatus.FAIL, "Error en los datos de entrada", e.messages, 400

        # Verificar si el usuario ya existe
        if session.query(Usuario).filter(
            (Usuario.nombre_usuario == data_validada["nombre_usuario"]) |
            (Usuario.email_usuario == data_validada["email_usuario"])
        ).first():
            return ResponseStatus.FAIL, "El nombre de usuario o email ya están registrados", None, 400

        # Generar y guardar OTP
        email = data_validada["email_usuario"]
        codigo_otp = generar_codigo_otp()
        guardar_otp(email, codigo_otp)
        guardar_datos_registro_temporal(email, data_validada)
        enviar_codigo_por_email_registro(email, codigo_otp)

        return ResponseStatus.SUCCESS, "OTP enviado al correo para completar el registro", None, 200

    def confirmar_registro(self, session: Session, email: str, otp: str, user_agent: str) -> tuple:
        if not verificar_otp_redis(email, otp):
            return ResponseStatus.FAIL, "OTP incorrecto o expirado", None, 400

        datos_registro = obtener_datos_registro_temporal(email)
        if not datos_registro:
            return ResponseStatus.FAIL, "Registro expirado o no iniciado", None, 400

        try:
            password_hash = generate_password_hash(datos_registro["password"])
            datos_registro["password"] = password_hash

            nuevo_usuario = Usuario(**datos_registro)
            nuevo_usuario.marcar_email_verificado()
            session.add(nuevo_usuario)
            session.flush()

            rol = get_rol_por_nombre(session, "usuario")
            if not rol:
                return ResponseStatus.NOT_FOUND, "Rol no encontrado", None, 404

            session.add(RolUsuario(id_usuario=nuevo_usuario.id_usuario, id_rol=rol.id_rol))
            session.add(PasswordLog(usuario_id=nuevo_usuario.id_usuario, password=password_hash, updated_at=datetime.now(timezone.utc)))
            session.add(UsuarioLog(usuario_id=nuevo_usuario.id_usuario, accion="registro", detalles="Registro con OTP"))
            session.add(DispositivoConfiable(usuario_id=nuevo_usuario.id_usuario, user_agent=user_agent, fecha_expira=datetime.now(timezone.utc) + timedelta(days=365)))
            
            
            session.commit()

            return ResponseStatus.SUCCESS, "Usuario registrado exitosamente", self.schema_out.dump(nuevo_usuario), 200
        except Exception as e:
            session.rollback()
            return ResponseStatus.ERROR, "Error interno al registrar usuario", str(e), 500

    # -----------------------------------------------------------------------------------------------------------------------------
    '''
    def verificar_email(self, session: Session, token: str) -> dict:
        if not token:
            return (ResponseStatus.NOT_FOUND, "Token no encontrado.", None, 404)
        try:
            datos = decodificar_token_verificacion(token)
            usuario = (
                session.query(Usuario).filter_by(email_usuario=datos["email"]).first()
            )
            if not usuario:
                return (ResponseStatus.NOT_FOUND, "Email no encontrado", None, 404)
            usuario.email_verificado = 1
            session.commit()
        except ExpiredSignatureError as error:
            return (ResponseStatus.UNAUTHORIZED, "El token ha expirado.", error, 401)
        except InvalidTokenError as error:
            return (ResponseStatus.UNAUTHORIZED, "El token es invalido.", error, 401)
        return (ResponseStatus.SUCCESS, "Email verificado correctamente.", None, 200)
    '''

    # -----------------------------------------------------------------------------------------------------------------------------
    # LOGIN Y LOGOUT
    # -----------------------------------------------------------------------------------------------------------------------------

    def login_usuario(
        self, session: Session, data: dict, user_agent: str, ip: str
    ) -> dict:
        try:
            data_validada = self.schema_login.load(data)
        except ValidationError as error:
            return (
                ResponseStatus.FAIL,
                "Error de schema / Bad Request",
                error.messages,
                400,
            )

        usuario = (
            session.query(Usuario)
            .filter_by(email_usuario=data_validada["email_usuario"])
            .first()
        )
        if not usuario:
            return (
                ResponseStatus.UNAUTHORIZED,
                "Email o contraseña incorrecta",
                None,
                401,
            )

        if not check_password_hash(usuario.password, data_validada["password"]):
            return (
                ResponseStatus.UNAUTHORIZED,
                "Email o contraseña incorrecta",
                None,
                401,
            )

        if not usuario.email_verificado:
            return (
                ResponseStatus.UNAUTHORIZED,
                "Debe verificar el email antes de loguearse.",
                None,
                401,
            )

        # Obtener el rol del usuario
        rol_usuario = (
            session.query(Rol)
            .join(RolUsuario)
            .filter(RolUsuario.id_usuario == usuario.id_usuario)
            .all()
        )
        roles_nombres = [rol.nombre_rol for rol in rol_usuario]

        # Obtener los permisos
        permisos = (
            session.query(Permiso.nombre_permiso)
            .join(RolPermiso, Permiso.id_permiso == RolPermiso.permiso_id)
            .join(RolUsuario, RolPermiso.id_rol == RolUsuario.id_rol)
            .filter(RolUsuario.id_usuario == usuario.id_usuario)
            .distinct()  # Para evitar duplicados
            .all()
        )

        permisos_lista = (p.nombre_permiso for p in permisos)

        # Verificar si el dispositivo ya está registrado
        dispositivo_confiable = (
            session.query(DispositivoConfiable)
            .filter_by(usuario_id=usuario.id_usuario, user_agent=user_agent)
            .first()
        )

        if not dispositivo_confiable or dispositivo_confiable.fecha_expira.replace(
            tzinfo=timezone.utc
        ) < datetime.now(timezone.utc):
            # Dispositivo nuevo o expirado → enviar email de validación
            enviar_email_validacion_dispositivo(usuario, user_agent, ip)
            return (
                ResponseStatus.PENDING,
                "Verificación de dispositivo enviada al email. Por favor confírmelo.",
                None,
                401,
            )
        else:
            # Crear token con permisos incluidos
            token, expires_in, expires_seconds = crear_token_acceso(
                usuario.id_usuario, usuario.email_usuario
            )

            refresh_token, refresh_expires = crear_token_refresh(usuario.id_usuario)
            # Registrar log de login
            session.add(
                UsuarioLog(
                    usuario_id=usuario.id_usuario,
                    accion="login",
                    detalles="El usuario se logueó correctamente",
                )
            )
            session.commit()

            usuario_data = self.schema_out.dump(usuario)
            try:
                # tomo el identificador unico del token y lo guardo en redis con sus permisos
                decoded = decode_token(token)
                get_redis().rpush(decoded["jti"], *permisos_lista)
                get_redis().expire(decoded["jti"], expires_seconds)
            except Exception as e:
                traceback.print_exc()

            usuario_data["token"] = token
            usuario_data["expires_in"] = expires_in
            usuario_data["refresh_token"] = refresh_token
            usuario_data["refresh_expires"] = refresh_expires.isoformat()
            usuario_data["rol"] = roles_nombres

            return (ResponseStatus.SUCCESS, "Login exitoso.", usuario_data, 200)

    # -----------------------------------------------------------------------------------------------------------------------------
    # terminar de modificar con persona-service
    def ver_perfil(self, session: Session, usuario_id: int) -> dict:
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id).first()

        if not usuario:
            return (ResponseStatus.NOT_FOUND, "Usuario no encontrado.", None, 404)

        perfil = {
            "id_usuario": usuario.id_usuario,
            "email": usuario.email,
            "fecha_creacion": (
                usuario.fecha_creacion.isoformat() if usuario.fecha_creacion else None
            ),
            "activo": usuario.activo,
            "rol": [
                r.rol.nombre for r in usuario.roles
            ],  # si tenés relación con RolUsuario
        }

        # Si tiene persona asociada, llamamos al microservicio persona-service
        if usuario.persona_id:
            try:
                import requests
                import os

                url = f"{os.getenv('PERSONA_SERVICE_URL', 'http://localhost:5001')}/personas/{usuario.persona_id}"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    perfil["persona"] = response.json()
                else:
                    perfil["persona"] = (
                        f"Error al consultar persona ({response.status_code})"
                    )
            except Exception as e:
                perfil["persona"] = f"Error al conectar con persona-service: {str(e)}"
        else:
            perfil["persona"] = "Sin persona asociada"

        return (ResponseStatus.SUCCESS, "Perfil obtenido correctamente.", perfil, 200)

    # -----------------------------------------------------------------------------------------------------------------------------
    def logout_usuario(self, session: Session, usuario_id: int) -> dict:

        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id).first()
        if not usuario:
            return (ResponseStatus.NOT_FOUND, "Usuario no encontrado", None, 404)

        # Agregar log de logout
        log = UsuarioLog(
            usuario_id=usuario.id_usuario,
            accion="logout",
            detalles="El usuario cerró sesión correctamente.",
        )
        session.add(log)
        session.commit()

        return (ResponseStatus.SUCCESS, "Logout exitoso.", None, 200)

    # -----------------------------------------------------------------------------------------------------------------------------
    # RECUPERACION DE PASSWORD CON CODIGO OTP VIA MAIL
    # -----------------------------------------------------------------------------------------------------------------------------

    def solicitar_codigo_reset(self, session: Session, email: str) -> dict:
        try:
            usuario = session.query(Usuario).filter_by(email_usuario=email).first()
            if not usuario:
                return ResponseStatus.FAIL, "Email no registrado", None, 404

            otp = generar_codigo_otp()
            guardar_otp(email, otp)
            enviar_codigo_por_email(usuario, otp)

            return ResponseStatus.SUCCESS, "Código OTP enviado al correo", None, 200
        except Exception as e:
            import traceback

            traceback.print_exc()
            return ResponseStatus.ERROR, "Error interno al solicitar código", None, 500

    def verificar_otp(self, session: Session, email: str, otp: str) -> dict:
        if not verificar_otp_redis(email, otp):
            return ResponseStatus.FAIL, "Código OTP inválido o expirado", None, 400
        try:
            token = generar_token_reset(email)
            guardar_token_recuperacion(email, token)

            return ResponseStatus.SUCCESS, "OTP válido", {"reset_token": token}, 200
        except Exception as e:
            import traceback

            traceback.print_exc()
            return ResponseStatus.ERROR, "Error interno al solicitar código", None, 500

    def cambiar_password_con_codigo(
        self, session: Session, data: dict, token: str, email: str
    ) -> dict:

        try:
            data_validada = self.schema_reset.load(data)
        except ValidationError as error:
            return (
                ResponseStatus.FAIL,
                "Error de schema / Bad Request",
                error.messages,
                400,
            )

        email_redis = verificar_token_recuperacion(token)
        if not email_redis or email != email_redis:
            return ResponseStatus.FAIL, "Token inválido o expirado", None, 400

        nueva_pass = data_validada.get("confirm_password")
        if not nueva_pass:
            return ResponseStatus.FAIL, "Contraseña nueva requerida", None, 400

        usuario = session.query(Usuario).filter_by(email_usuario=email).first()
        if not usuario:
            return ResponseStatus.FAIL, "Usuario no encontrado", None, 404

        if check_password_hash(usuario.password, data_validada["confirm_password"]):
            return (
                ResponseStatus.FAIL,
                "La contraseña debe ser diferente a la anterior",
                None,
                400,
            )

        # Aquí actualizas y registras contraseña
        usuario.password = generate_password_hash(nueva_pass)  # tu función de hash
        session.commit()

        return ResponseStatus.SUCCESS, "Contraseña actualizada correctamente", None, 200
