from datetime import datetime, timezone,timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Session
from app.models.usuarios import Usuario, PasswordLog, UsuarioLog
from app.models.dispositivos_confiable import DispositivoConfiable
from app.models.rol import RolUsuario,Rol,RolPermiso
from app.services.rol import get_rol_por_nombre
from app.utils.jwt import crear_token_acceso,crear_token_reset_password, crear_token_refresh
from app.schemas.usuarios_schema import LoginSchema,UsuarioInputSchema,UsuarioOutputSchema,ResetPasswordSchema,RecuperarPasswordSchema
from marshmallow import ValidationError
from app.services.servicio_base import ServicioBase
from app.models.permisos import Permiso
from app.models.otp_reset_password_model import OtpResetPassword
from app.utils.email import enviar_email_verificacion,generar_codigo_otp,enviar_codigo_por_email,decodificar_token_verificacion,enviar_email_validacion_dispositivo
from jwt import ExpiredSignatureError, InvalidTokenError
from app.utils.response import ResponseStatus, make_response
from flask_jwt_extended import  create_access_token


class UsuarioService(ServicioBase):
    def __init__(self):
        super().__init__(model=Usuario, schema=UsuarioInputSchema())
        self.schema_out=UsuarioOutputSchema()
        self.schema_recuperar=RecuperarPasswordSchema()
        self.schema_reset = ResetPasswordSchema()
        self.schema_login = LoginSchema()

#-----------------------------------------------------------------------------------------------------------------------------
#REGISTRO Y VERIFICACIÓN
#-----------------------------------------------------------------------------------------------------------------------------

    def registrar_usuario(self, session: Session, data: dict) -> dict:
        try:
            data_validada = self.schema.load(data)
        except ValidationError as error:
            return ResponseStatus.FAIL,"Error de schema / Bad Request",error.messages,400
                        
                    
        
        if session.query(Usuario).filter(
            (Usuario.nombre_usuario == data_validada['nombre_usuario']) |
            (Usuario.email_usuario == data_validada['email_usuario'])
        ).first():
            return ResponseStatus.ERROR,"El nombre de usuario o el email ya están registrados",None, 400
                        
        
        password_hash = generate_password_hash(data_validada['password'])
        data_validada["password"] = password_hash

        nuevo_usuario = self.create(session, data_validada)
        session.flush()
        enviar_email_verificacion(nuevo_usuario)

        rol_por_defecto = get_rol_por_nombre(session, "usuario")
        if not rol_por_defecto:
            return ResponseStatus.NOT_FOUND,"Rol no encontrado.",None,404
                    

        session.add(RolUsuario(
            id_usuario=nuevo_usuario.id_usuario,
            id_rol=rol_por_defecto.id_rol
        ))

        session.add(PasswordLog(
            usuario_id=nuevo_usuario.id_usuario,
            password=password_hash,
            updated_at=datetime.now(timezone.utc)
        ))

        session.add(UsuarioLog(
            usuario_id=nuevo_usuario.id_usuario,
            accion="registro",
            detalles="El usuario se registró correctamente"
        ))

        session.commit()
        return ResponseStatus.SUCCESS,"Usuario se registrado con exito, se ha enviado un mail de verificación.",self.schema_out.dump(nuevo_usuario), 200
                
#-----------------------------------------------------------------------------------------------------------------------------
    def verificar_email(self,session:Session,token:str)->dict:
        if not token:
            return (
                        ResponseStatus.NOT_FOUND,
                        "Token no encontrado.",
                        None,
                        404
                    )
        try:
            datos = decodificar_token_verificacion(token)
            usuario = session.query(Usuario).filter_by(email_usuario=datos['email']).first()
            if not usuario:
                return (
                            ResponseStatus.NOT_FOUND,
                            "Email no encontrado",
                            None,
                            404
                        )
            usuario.email_verificado = 1
            session.commit()
        except ExpiredSignatureError as error:
            return (
                        ResponseStatus.UNAUTHORIZED,
                        "El token ha expirado.",
                        error, 
                        401
                    )
        except InvalidTokenError as error:
            return (
                        ResponseStatus.UNAUTHORIZED,
                        "El token es invalido.",
                        error, 
                        401
                    )
        return (
                    ResponseStatus.SUCCESS,
                    "Email verificado correctamente.",
                    None, 
                    200
                )
    
#-----------------------------------------------------------------------------------------------------------------------------
#LOGIN Y LOGOUT
#-----------------------------------------------------------------------------------------------------------------------------

    def login_usuario(self, session: Session, data:dict, user_agent: str , ip: str) -> dict:
        try:
            data_validada = self.schema_login.load(data)
        except ValidationError as error:
            return (
                        ResponseStatus.FAIL,
                        "Error de schema / Bad Request",
                        error.messages,
                        400
                    )

        usuario = session.query(Usuario).filter_by(email_usuario=data_validada['email_usuario']).first()
        if not usuario:
            return (
                        ResponseStatus.UNAUTHORIZED,
                        "Email o contraseña incorrecta",
                        None,
                        401
                    )
        
        if not check_password_hash(usuario.password, data_validada["password"]):
            return (
                        ResponseStatus.UNAUTHORIZED,
                        "Email o contraseña incorrecta",
                        None,
                        401
                    )

        if not usuario.email_verificado:
            return (
                        ResponseStatus.UNAUTHORIZED,
                        "Debe verificar el email antes de loguearse.",
                        None, 
                        401
                    )
        
        # Obtener el rol del usuario
        rol_usuario = session.query(Rol).join(RolUsuario).filter(RolUsuario.id_usuario == usuario.id_usuario).first()
        rol_nombre = rol_usuario.nombre_rol if rol_usuario else "sin_rol"

        # Obtener los permisos asociados al rol
        permisos_query = (
            session.query(Permiso.nombre_permiso)
            .join(RolPermiso, Permiso.id_permiso == RolPermiso.permiso_id)
            .filter(RolPermiso.id_rol == rol_usuario.id_rol)
            .all()
        )
        permisos_lista = [p.nombre_permiso for p in permisos_query]

        # Verificar si el dispositivo ya está registrado
        dispositivo_confiable = session.query(DispositivoConfiable).filter_by(
        usuario_id=usuario.id_usuario,
        user_agent=user_agent
        ).first()

        if not dispositivo_confiable or dispositivo_confiable.fecha_expira.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
           # Dispositivo nuevo o expirado → enviar email de validación
           enviar_email_validacion_dispositivo(usuario, user_agent, ip)
           return (
            ResponseStatus.PENDING,
            "Verificación de dispositivo enviada al email. Por favor confírmelo.",
            None,
            401
          )
        else:
            # Crear token con permisos incluidos
            token, expires_in = crear_token_acceso(
               usuario.id_usuario,
               usuario.email_usuario,
               rol_nombre,
               permisos_lista
            )
            refresh_token, refresh_expires= crear_token_refresh(usuario.id_usuario)
            # Registrar log de login
            session.add(UsuarioLog(
               usuario_id=usuario.id_usuario,
               accion="login",
               detalles="El usuario se logueó correctamente"
            ))
            session.commit()

            usuario_data = self.schema_out.dump(usuario)
            usuario_data["token"] = token
            usuario_data["expires_in"] = expires_in
            usuario_data["refresh_token"] = refresh_token
            usuario_data["refresh_expires"] = refresh_expires.isoformat()

            return (
               ResponseStatus.SUCCESS,
               "Login exitoso.",
               usuario_data,
               200
            )
#-----------------------------------------------------------------------------------------------------------------------------
#terminar de modificar con persona-service
    def ver_perfil(self, session: Session, usuario_id: int) -> dict:
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id).first()

        if not usuario:
            return (
                ResponseStatus.NOT_FOUND,
                "Usuario no encontrado.",
                None,
                404
            )

        perfil = {
            "id_usuario": usuario.id_usuario,
            "email": usuario.email,
            "fecha_creacion": usuario.fecha_creacion.isoformat() if usuario.fecha_creacion else None,
            "activo": usuario.activo,
            "rol": [r.rol.nombre for r in usuario.roles]  # si tenés relación con RolUsuario
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
                    perfil["persona"] = f"Error al consultar persona ({response.status_code})"
            except Exception as e:
                perfil["persona"] = f"Error al conectar con persona-service: {str(e)}"
        else:
            perfil["persona"] = "Sin persona asociada"

        return (
            ResponseStatus.SUCCESS,
            "Perfil obtenido correctamente.",
            perfil,
            200
        )

#-----------------------------------------------------------------------------------------------------------------------------
    def logout_usuario(self, session: Session, usuario_id: int) -> dict:

        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id).first()
        if not usuario:
            return (
                ResponseStatus.NOT_FOUND,
                "Usuario no encontrado",
                None,
                404
            )

        # Agregar log de logout
        log = UsuarioLog(
            usuario_id=usuario.id_usuario,
            accion="logout",
            detalles="El usuario cerró sesión correctamente."
        )
        session.add(log)
        session.commit()

        return (
            ResponseStatus.SUCCESS,
            "Logout exitoso.",
            None,
            200
        )

#-----------------------------------------------------------------------------------------------------------------------------
#RECUPERACION DE PASSWORD CON CODIGO OTP VIA MAIL
#-----------------------------------------------------------------------------------------------------------------------------

#crea el codigo de 6 digitos y expiracion y lo envia por mail. 
#y en la base de datos se guarda todos los datos para su verificacion dsp.
    def solicitar_codigo_reset(self, session: Session, email: str) -> dict:
        try:
            self.schema_recuperar.load({"email": email})
        except ValidationError as error:
            return (
                ResponseStatus.FAIL,
                "Error de schema / Bad Request",
                error.messages,
                400
            )
        
        usuario = session.query(Usuario).filter_by(email_usuario=email).first()
        if not usuario:
            return (
                        ResponseStatus.NOT_FOUND,
                        "Usuario no fue encontrado",
                        None, 
                        404
                    )
        
        codigo = generar_codigo_otp()

        otp_entry = OtpResetPassword(
            usuario_id=usuario.id_usuario,
            codigo_otp=codigo,
            expira_en=datetime.now(timezone.utc) + timedelta(minutes=15)
        )
        session.add(otp_entry)
        session.commit()

        enviar_codigo_por_email(usuario, codigo)

        return (
                        ResponseStatus.SUCCESS, 
                        "Codigo enviado al mail", 
                        None, 
                        200
                        )
#-----------------------------------------------------------------------------------------------------------------------------
    #recibe el codigo del usuario, e email y hace una busqueda del ultimo codigo generado del usuario
    #valida que sea
    def verificar_otp(self, session: Session, email: str, otp: str) -> dict:
        usuario = session.query(Usuario).filter_by(email_usuario=email).first()
        if not usuario:
            return (
                        ResponseStatus.NOT_FOUND,
                        "Usuario no fue encontrado",
                        None, 
                        404
                    )
        
        otp_entry = (
            session.query(OtpResetPassword)
            .filter_by(usuario_id=usuario.id_usuario, codigo_otp=otp, usado=False)
            .order_by(OtpResetPassword.creado_en.desc())
            .first()
        )
        
        if not otp_entry or datetime.now(timezone.utc) > otp_entry.expira_en.replace(tzinfo=timezone.utc):
            return (
                        ResponseStatus.UNAUTHORIZED,
                        "El codigo es inválido o ha expirado.",
                        None, 
                        401
                    )
        
        token = crear_token_reset_password(otp_entry.id, usuario.id_usuario)

        return (
                        ResponseStatus.SUCCESS,
                        "codigo verificado",
                        {"reset_token": token}, 
                        200
                )

#-----------------------------------------------------------------------------------------------------------------------------
    def cambiar_password_con_codigo(self, session: Session, data :dict, token:str)->dict:
        try:
            payload = decodificar_token_verificacion(token)

        except ExpiredSignatureError as error:
            return (
                        ResponseStatus.UNAUTHORIZED,
                        "El token ha expirado.",
                        error, 
                        401
                    )
        except InvalidTokenError as error:
            return (
                        ResponseStatus.UNAUTHORIZED,
                        "El token es invalido.",
                        error, 
                        401
                    )
        
        if payload.get("scope") != "reset_password":
            return (
                        ResponseStatus.UNAUTHORIZED,
                        "El token es invalido para esta operación.",
                        error, 
                        401
                    ) 
        
        
        otp_id = payload.get("otp_id")
        usuario_id = payload.get("sub")

        otp_entry = session.query(OtpResetPassword).filter_by(id=otp_id, usado=False).first()
        if not otp_entry or int(usuario_id) != otp_entry.usuario_id:
            return (
                        ResponseStatus.UNAUTHORIZED, 
                        "Código de recuperación inválido o ya usado", 
                        None, 
                        401
                    )
        
        try:
            data_validad = self.schema_reset.load(data)
        except ValidationError as error:
            return (
                        ResponseStatus.FAIL,
                        "Error de schema/Bad Request",
                        error.messages, 
                        400
                    )
        
        
        usuario = session.query(Usuario).filter_by(id_usuario=otp_entry.usuario_id).first()
        if not usuario:
            return (
                        ResponseStatus.NOT_FOUND,
                        "Usuario no fue encontrado",
                        None, 
                        404
                    )
        
        if check_password_hash(usuario.password, data_validad["password"]):
            return (
                        ResponseStatus.FAIL,
                        "La nueva contraseña debe ser diferente a la anterior",
                        None, 
                        400
                    )
        
        hashed_password = generate_password_hash(data_validad["password"])
        usuario.password = hashed_password
        usuario.password_changed_at = datetime.now(timezone.utc)

        otp_entry.usado = True
        session.add(PasswordLog(
                usuario_id=usuario.id_usuario,
                password=hashed_password,
                updated_at=datetime.now(timezone.utc)
            ))

        session.add(UsuarioLog(
                usuario_id=usuario.id_usuario,
                accion="Cambio de password.",
                detalles="Se cambio el password."
            ))

        session.commit()

        return (
                    ResponseStatus.SUCCESS,
                    "Contraseña actualizada con éxito.",
                    {"usuario_id": usuario.id_usuario}, 
                    200
                )
#------------------------------------------------------------------------------------------------

    def refresh_token(self, session: Session, usuario_id: int) -> dict:
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id).first()
        if not usuario:
          return {
            "status": ResponseStatus.UNAUTHORIZED,
            "message": "Usuario no encontrado",
            "data": None,
            "code": 401
          }

        rol = (
           session.query(Rol)
           .join(RolUsuario, Rol.id_rol == RolUsuario.id_rol)
           .filter(RolUsuario.id_usuario == usuario.id_usuario)
           .first()
        )
        rol_nombre = rol.nombre_rol if rol else "sin_rol"

        permisos_query = (
           session.query(Permiso.nombre_permiso)
           .join(RolPermiso, Permiso.id_permiso == RolPermiso.permiso_id)
           .filter(RolPermiso.id_rol == rol.id_rol)
           .all()
        )
        permisos = [p.nombre_permiso for p in permisos_query]

        nuevo_access_token = create_access_token(
            identity=usuario_id,
            additional_claims={
               "sub": usuario.id_usuario,
               "email": usuario.email_usuario,
               "rol": rol_nombre,
               "permisos": permisos
            }
        )

        return {
              "status": ResponseStatus.SUCCESS.value,
              "message": "Nuevo token generado exitosamente.",
              "data": {"access_token": nuevo_access_token},
              "code": 200
        }