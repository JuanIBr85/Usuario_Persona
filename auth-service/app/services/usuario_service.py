from datetime import datetime, timezone, timedelta
import traceback
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
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
    create_access_token,
)
from app.schemas.usuarios_schema import (
    LoginSchema,
    UsuarioInputSchema,
    UsuarioOutputSchema,
    ResetPasswordSchema,
    RecuperarPasswordSchema,
    UsuarioModificarSchema
)
from marshmallow import ValidationError
from app.services.servicio_base import ServicioBase
from app.models.permisos import Permiso
from app.utils.email import (
    enviar_codigo_reset_por_email,
    enviar_codigo_por_email_registro,
    enviar_solicitud_restauracion_admin,
    enviar_email_validacion_dispositivo,
    enviar_email_modificar_email,
    enviar_email_confirmacion_eliminacion,
)
from app.utils.otp_manager import (
    guardar_otp,
    verificar_otp_redis,
    guardar_token_recuperacion,
    verificar_token_recuperacion,
    guardar_datos_registro_temporal,
    obtener_datos_registro_temporal,
    registrar_refresh_token,
    revocar_refresh_token,
    generar_codigo_otp,
)
from app.utils.logs_utils import log_usuario_accion
from flask_jwt_extended import decode_token
from app.extensions import get_redis
from common.services.send_message_service import send_message
from common.utils.response import ResponseStatus
import logging
logger = logging.getLogger(__name__)
"""
Servicio: UsuarioService

Este módulo implementa la lógica del microservicio de autenticación relacionada
con usuarios finales. Incluye funcionalidades de:
- Registro y confirmación por email con OTP
- Login con validación de dispositivo confiable
- Recuperación de contraseña
- Modificación de nombre y email
- Eliminación lógica de cuenta y restauración
- Refresh y rotación de tokens

Nota:
Cada método incluye validaciones, logs de auditoría y en algunos casos
interacción con otros microservicios mediante eventos.
"""

class UsuarioService(ServicioBase):
    def __init__(self):
        super().__init__(model=Usuario, schema=UsuarioInputSchema())
        self.schema_out = UsuarioOutputSchema()
        self.schema_recuperar = RecuperarPasswordSchema()
        self.schema_reset = ResetPasswordSchema()
        self.schema_login = LoginSchema()
        self.schema_modificar = UsuarioModificarSchema()
    # -----------------------------------------------------------------------------------------------------------------------------
    # REGISTRO Y VERIFICACIÓN
    # -----------------------------------------------------------------------------------------------------------------------------
    
    def iniciar_registro(self, session: Session, data: dict) -> dict:
        """
        Inicia el proceso de registro para un nuevo usuario.

        Valida los datos de entrada, verifica si el email o nombre ya existen,
        y si no existen, guarda temporalmente los datos en Redis y envía un OTP
        al correo electrónico.

        Args:
         session (Session): Objeto de sesión de SQLAlchemy.
         data (dict): Diccionario con los datos del usuario.

        Returns:
         dict: Tupla con estado (ResponseStatus), mensaje, detalle y código HTTP.

        Raise:
         ValidationError: Si los datos no cumplen con el esquema.
         Exception: Si ocurre un error al guardar datos o enviar el correo.
        """
        try:
            data_validada = self.schema.load(data)
        except ValidationError as e:
            return ResponseStatus.FAIL, "Error en los datos de entrada", e.messages, 400

        usuario_existente = session.query(Usuario).filter(
            (func.lower(Usuario.email_usuario) == data_validada["email_usuario"].lower()) |
            ((Usuario.nombre_usuario) == data_validada["nombre_usuario"].strip().lower())
        ).first()

        if usuario_existente:
            if usuario_existente.eliminado:
                enviar_solicitud_restauracion_admin(usuario_existente)
                return (
                    ResponseStatus.FAIL,
                    "Ya existe una cuenta con este email desactivada. Hemos notificado al administrador. Verifique su email en las proximas 48 horas",
                    None,
                    403,
                )
            else:
                return (
                    ResponseStatus.FAIL,
                    "El nombre de usuario o email ya están registrados.",
                    None,
                    400,
                )

        # Generar y guardar OTP
        email = data_validada["email_usuario"]
        codigo_otp = generar_codigo_otp()
        guardar_otp(email, codigo_otp)
        guardar_datos_registro_temporal(email, data_validada)
        enviar_codigo_por_email_registro(email, codigo_otp)

        return (
            ResponseStatus.SUCCESS,
            "OTP enviado al correo para completar el registro",
            None,
            200,
        )

    def confirmar_registro( self, session: Session, email: str, otp: str, user_agent: str ) -> dict:
        """
        Confirma el registro de un usuario validando el OTP recibido por email.

        Si el OTP es válido, se crea el usuario, se marca el email como verificado,
        se asigna el rol por defecto, se registra el password, y se marca el dispositivo como confiable.

        Args:
         session (Session): Objeto de sesión de SQLAlchemy.
         email (str): Email del usuario.
         otp (str): Código de verificación OTP.
         user_agent (str): Identificador del dispositivo desde el que se registra.

        Returns:
         dict: Tupla con estado, mensaje, datos de usuario y código HTTP.

        Raise:
         Exception: Si ocurre un error durante la creación del usuario o el envío de eventos.
     """
        email = email.strip().lower()
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

            session.add(
                RolUsuario(id_usuario=nuevo_usuario.id_usuario, id_rol=rol.id_rol)
            )
            session.add(
                PasswordLog(
                    usuario_id=nuevo_usuario.id_usuario,
                    password=password_hash,
                    updated_at=datetime.now(timezone.utc),
                )
            )

            session.add(
                DispositivoConfiable(
                    usuario_id=nuevo_usuario.id_usuario,
                    user_agent=user_agent,
                    fecha_expira=datetime.now(timezone.utc) + timedelta(days=365),
                )
            )

            session.commit()
            key = f"registro_temp:{email}"
            get_redis().delete(key)

        except Exception as e:
            session.rollback()
            traceback_str = traceback.format_exc()
            print("[ERROR] Error al registrar usuario:\n", traceback_str)
            return (
                ResponseStatus.ERROR,
                "Error interno al registrar usuario",
                str(e),
                500,
            )
        
        try:
            send_message(
                to_service="persona-service",
                message={
                    "id_usuario": nuevo_usuario.id_usuario,
                    "email": nuevo_usuario.email_usuario,
                },
                event_type="auth_user_register",
            )
        except Exception as e:
            print("[WARNING] Error al enviar mensaje a persona-service:", e, flush=True)
        
        log_usuario_accion(session, nuevo_usuario.id_usuario, "Registro exitoso")
        # Respuesta final
        return (
            ResponseStatus.SUCCESS,
            "Usuario registrado exitosamente",
            self.schema_out.dump(nuevo_usuario),
            200,
        )
    

#----------------------renvio de otp registro------------------------------------

    def reenviar_otp_registro(self, session: Session, email: str) -> tuple:
        """
        Reenvía un nuevo código OTP al correo electrónico de un usuario que está en proceso de registro.

        Este método permite al usuario recibir un nuevo código de verificación si el anterior se perdió, expiró
        o no fue recibido. Solo se ejecuta si el usuario aún no está registrado y si existe un registro temporal
        en Redis vinculado al correo electrónico.

        Args:
          session (Session): Sesión activa de SQLAlchemy.
          email (str): Dirección de correo electrónico del usuario en proceso de registro.

        Returns:
          tuple: Una tupla con los siguientes elementos:
            - ResponseStatus: Enum que indica el estado de la respuesta (SUCCESS, FAIL).
            - str: Mensaje descriptivo del resultado.
            - Optional[dict]: Datos adicionales (normalmente None en este caso).
            - int: Código HTTP correspondiente (200, 400, 404).
        """
        email = email.strip().lower()
        if session.query(Usuario).filter(Usuario.email_usuario == email).first():
            return (
            ResponseStatus.FAIL,
            "El usuario ya está registrado",
            None,
            400,
        )

        # Buscar datos temporales del registro desde redis
        datos_temporales = obtener_datos_registro_temporal(email)
        if not datos_temporales:
            return (
                ResponseStatus.FAIL,
                f"No hay registro pendiente para {email}.",
                None,
                404,
            )   

        # Generar nuevo OTP y guarda
        nuevo_otp = generar_codigo_otp()
        guardar_otp(email, nuevo_otp)

        # Actualizar los datos temporales (por si querés regenerar todo, pero si no, simplemente reenviá)
        enviar_codigo_por_email_registro(email, nuevo_otp)

        return (
          ResponseStatus.SUCCESS,
          "Se ha reenviado el código OTP al correo electrónico",
          None,
          200,
        )  
    # -----------------------------------------------------------------------------------------------------------------------------
    # LOGIN Y LOGOUT
    # -----------------------------------------------------------------------------------------------------------------------------

    def login_usuario(self, session: Session, data: dict, user_agent: str, ip: str) -> dict:
        """
        Autentica a un usuario mediante email y contraseña, valida el dispositivo,
        y genera tokens de acceso y refresh con permisos incluidos.

        Este método:
         - Valida el esquema del request con `LoginSchema`.
         - Verifica que el usuario exista y su contraseña sea correcta.
         - Rechaza el acceso si hay una solicitud de eliminación pendiente.
         - Verifica si el dispositivo es confiable (sino, envía un email de validación).
         - Genera un token de acceso con permisos y un token de refresh.
         - Registra los permisos en Redis.
         - Devuelve la información del usuario autenticado.

         Args:
          session (Session): Sesión activa de SQLAlchemy.
          data (dict): Diccionario con las credenciales del usuario (email y password).
          user_agent (str): Agente de usuario del dispositivo actual (browser, app, etc.).
          ip (str): Dirección IP desde donde se intenta iniciar sesión.

        Returns:
          dict: Una tupla con los siguientes elementos:
            - ResponseStatus: Estado de la respuesta (SUCCESS, FAIL, UNAUTHORIZED, PENDING).
            - str: Mensaje descriptivo del resultado.
            - Optional[dict]: Datos del usuario con tokens o None.
            - int: Código HTTP correspondiente (200, 400, 403).
        """
        logger.info("→ Iniciando login de usuario")
        try:
            data_validada = self.schema_login.load(data)
        except ValidationError as error:
            logger.warning(f"→ Error de validación: {error.messages}")
            return (
                ResponseStatus.FAIL,
                "Error de schema / Bad Request",
                error.messages,
                400,
            )

        usuario = (
            session.query(Usuario)
            .filter_by(email_usuario=data_validada["email_usuario"],eliminado=False)
            .first()
        )
        if not usuario:
            logger.warning("→ Usuario no encontrado o eliminado")
            return (
                ResponseStatus.UNAUTHORIZED,
                "Email o contraseña incorrecta",
                None,
                400,
            )

        if not check_password_hash(usuario.password, data_validada["password"]):
            logger.warning("→ Contraseña incorrecta")
            return (
                ResponseStatus.UNAUTHORIZED,
                "Email o contraseña incorrecta",
                None,
                400,
            )
        if get_redis().get(f"eliminacion_pendiente:{usuario.id_usuario}"):
            logger.info("→ Usuario con eliminación pendiente")
            return ResponseStatus.FAIL, (
                "Tu cuenta tiene una solicitud de eliminación pendiente. "
                "Si no realizaste esta acción, esperá 30 minutos y luego podés iniciar sesión nuevamente."
                "Si no has sido tu puedes dar aviso a los administradores."
            ), None, 403
        logger.info(f"→ Usuario {usuario.id_usuario} autenticado, generando tokens...")
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
        try:
            if not dispositivo_confiable or dispositivo_confiable.fecha_expira.replace(
                tzinfo=timezone.utc
            ) < datetime.now(timezone.utc):
                # Dispositivo nuevo o expirado → enviar email de validación
                enviar_email_validacion_dispositivo(usuario, user_agent, ip)
                logger.info("→ Dispositivo no confiable, se envió mail de validación")
                return (
                    ResponseStatus.PENDING,
                    "Verificación de dispositivo enviada al email. Por favor confírmelo.",
                    None,
                    403,
                )

            else:
                # Crear token de refresh
                refresh_token, refresh_expires, jti_refresh = crear_token_refresh(usuario.id_usuario)
                # Crear token con permisos incluidos
                token, expires_in, expires_seconds = crear_token_acceso(
                    usuario.id_usuario, usuario.email_usuario, jti_refresh
                )
                logger.info("→ Tokens generados correctamente")
        except Exception as error:
            logger.error("Error al generar tokens", exc_info=error)
            return ResponseStatus.FAIL, "error de dispositivo ", str(error), 400

        
        try:
            registrar_refresh_token(jti_refresh, refresh_expires)
        except Exception as e:
            logger.error("Error al registrar refresh token en Redis", exc_info=e)

        usuario_data = self.schema_out.dump(usuario)
        try:
            # tomo el identificador unico del token y lo guardo en redis con sus permisos
            decoded = decode_token(token)
            get_redis().rpush(decoded["jti"], *permisos_lista)
            get_redis().expire(decoded["jti"], expires_seconds)
            logger.info("→ Permisos almacenados en Redis")
        except Exception as e:
            logger.error("Error al guardar permisos en Redis", exc_info=e)
        

        usuario_data["token"] = token
        usuario_data["expires_in"] = expires_in
        usuario_data["refresh_token"] = refresh_token
        usuario_data["refresh_expires"] = refresh_expires.isoformat()
        usuario_data["rol"] = roles_nombres

        logger.info(f"→ Login finalizado para usuario {usuario.id_usuario}")
        log_usuario_accion(session, usuario.id_usuario, "Login exitoso", f"Email: {usuario.email_usuario}")
        return ResponseStatus.SUCCESS, "Login exitoso.", usuario_data, 200

    # -----------------------------------------------------------------------------------------------------------------------------
    # terminar de modificar con persona-service
    def ver_perfil(self, session: Session, usuario_id: int) -> dict:
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id,eliminado=False).first()

        if not usuario:
            return (ResponseStatus.NOT_FOUND, "Usuario no encontrado.", None, 404)

        perfil = {
            "id_usuario": usuario.id_usuario,
            "email": usuario.email,
            "fecha_creacion": (
                usuario.fecha_creacion.isoformat() if usuario.fecha_creacion else None
            ),
            "activo": usuario.eliminado,
            "rol": [
                r.rol.nombre for r in usuario.roles
            ],  # si tenés relación con RolUsuario
        }

        return (ResponseStatus.SUCCESS, "Perfil obtenido correctamente.", perfil, 200)

    # -----------------------------------------------------------------------------------------------------------------------------

    def modificar_nombre_usuario(self, session: Session, usuario_id: int, nuevo_nombre_usuario: str = None) -> dict:
        """
        Modifica el nombre de usuario de un usuario dado su ID.

        Este método:
        - Verifica que el usuario exista y no esté eliminado.
        - Compara el nuevo nombre con el actual para evitar cambios innecesarios.
        - Verifica que no exista otro usuario con el mismo nombre (ignorando mayúsculas/minúsculas).
        - Guarda el nuevo nombre tal como lo ingresó el usuario, sin alterarlo.
        - Actualiza el registro en la base de datos y retorna los nuevos datos.

        Args:
         session (Session): Sesión activa de SQLAlchemy.
         usuario_id (int): ID del usuario a modificar.
         nuevo_nombre_usuario (str): Nuevo nombre de usuario propuesto.

        Returns:
         dict: Tupla con los siguientes elementos:
            - ResponseStatus: Estado de la operación (SUCCESS, FAIL).
            - str: Mensaje descriptivo.
            - Optional[dict]: Datos actualizados del usuario o None.
            - int: Código HTTP correspondiente (200, 400, 404, 409).
        """
        try:
            usuario = session.query(Usuario).filter_by(id_usuario=usuario_id, eliminado=False).first()
            if not usuario:
                return ResponseStatus.FAIL, "Usuario no encontrado", None, 404

            # Normalizamos para comparar, pero no para guardar
            nuevo_nombre_normalizado = nuevo_nombre_usuario.strip().lower()
            nombre_actual_normalizado = usuario.nombre_usuario.strip().lower()

            # Si es el mismo nombre, no hacer nada
            if nuevo_nombre_normalizado == nombre_actual_normalizado:
                return (
                    ResponseStatus.FAIL,
                    "El nuevo nombre es igual al actual",
                    None,
                    400,
                )

            # Si ya existe otro usuario con ese nombre (case insensitive)
            existente = session.query(Usuario).filter(
                func.lower(Usuario.nombre_usuario) == nuevo_nombre_normalizado,
                Usuario.id_usuario != usuario_id,  # Importante para no coincidir consigo mismo
            ).first()

            if existente:
                return ResponseStatus.FAIL, "El nombre de usuario ya está en uso", None, 409

            # Guardar tal cual lo envió el usuario
            usuario.nombre_usuario = nuevo_nombre_usuario.strip()

            session.commit()
            session.refresh(usuario)

            return ResponseStatus.SUCCESS, "Usuario modificado con éxito", {
                "id_usuario": usuario.id_usuario,
                "nombre_usuario": usuario.nombre_usuario,
            }, 200

        except Exception as e:
            session.rollback()
            raise e

    # -----------------------------------------------------------------------------------------------------------------------------

    def modificar_email_usuario(self, session: Session,usuario_id: int,nuevo_email:str,password:str) -> dict:
        """
        Inicia el proceso de cambio de email de un usuario autenticado.

        Este método:
        - Verifica que el usuario exista y no esté eliminado.
        - Comprueba la contraseña del usuario por seguridad.
        - Valida que el nuevo email no coincida con el actual.
        - Verifica que el nuevo email no esté en uso por otro usuario.
        - Si todo es válido, envía un correo al nuevo email para confirmar el cambio.
        - El cambio real del email se realizará al confirmar dicho correo (fuera de este método).

        Args:
         session (Session): Sesión activa de SQLAlchemy.
         usuario_id (int): ID del usuario que desea cambiar su email.
         nuevo_email (str): Nuevo email propuesto.
         password (str): Contraseña actual del usuario para verificar identidad.

        Returns:
         dict: Tupla con los siguientes elementos:
            - ResponseStatus: Estado de la operación.
            - str: Mensaje descriptivo.
            - Optional[dict]: Datos adicionales o None.
            - int: Código HTTP correspondiente.
        """
        try:
            usuario = session.query(Usuario).filter_by(id_usuario=usuario_id,eliminado=False).first()
            if not usuario:
                return ResponseStatus.FAIL, "Usuario no encontrado", None, 404
            
            if not check_password_hash(usuario.password, password):
                return (
                    ResponseStatus.UNAUTHORIZED,
                    "Contraseña incorrecta",
                    None,
                    400,
                )            
                
            nuevo_email_normalizado = nuevo_email.strip().lower()

            if nuevo_email_normalizado == usuario.email_usuario:
                return (
                    ResponseStatus.FAIL,
                    "El nuevo email es igual al actual",
                    None,
                    400,
                )

            existente = session.query(Usuario).filter_by(email_usuario=nuevo_email_normalizado).first()
            if existente:
                return ResponseStatus.FAIL, "El email ya está en uso", None, 409

            enviar_email_modificar_email(usuario, nuevo_email_normalizado)

            return ResponseStatus.SUCCESS, "Email enviado al nuevo correo", None, 200

        except Exception as e:
            session.rollback()
            raise e

    # -----------------------------------------------------------------------------------------------------------------------------
    def confirmacion_modificar_email(self, session:Session, datos:dict)->dict:
        """
        Confirma y aplica el cambio de email de un usuario mediante un token validado.

        Este método:
        - Verifica que el tipo de acción contenida en los datos sea "modificar_email".
        - Obtiene el ID del usuario y el nuevo email desde el token decodificado.
        - Valida que el usuario exista y no esté eliminado.
        - Actualiza el email del usuario con el nuevo valor.
        - Registra la acción en el log de auditoría.

        Args:
         session (Session): Sesión activa de SQLAlchemy.
         datos (dict): Diccionario extraído del token con los campos:
            - "type": debe ser "modificar_email".
            - "sub": ID del usuario.
            - "nuevo_email": nuevo correo electrónico a aplicar.

        Returns:
         dict: Tupla con:
            - ResponseStatus: Estado de la operación.
            - str: Mensaje descriptivo.
            - Optional[dict]: Datos del usuario actualizado o None.
            - int: Código HTTP asociado.
        """
        try:
            if datos.get("type") != "modificar_email":
                raise ValueError("Token inválido")

            usuario_id = datos["sub"]
            nuevo_email = datos["nuevo_email"]

            usuario = session.query(Usuario).filter_by(id_usuario=usuario_id, eliminado=False).first()
            if not usuario:
                raise ValueError("Usuario no encontrado")

            usuario.email_usuario = nuevo_email
            session.commit()
            log_usuario_accion(session, usuario_id, "confirmar_modificar_email", f"Nuevo email: {usuario.email_usuario}")

            return ResponseStatus.SUCCESS, "Email de Usuario modificado con éxito", {
                    "id_usuario": usuario.id_usuario,
                    "email_usuario": usuario.email_usuario
                }, 200
        
        except Exception as e:
            session.rollback()
            raise e


    # -----------------------------------------------------------------------------------------------------------------------------
 
    def solicitar_eliminacion(self, session: Session,usuario_id: int,email_data:str,password:str,user_agent:str, ip_solicitud:str, jti:str, jti_refresh:str) -> dict:
            """
            Inicia el proceso de eliminación de cuenta para un usuario autenticado.

            Este método:
             - Verifica la existencia del usuario y su estado activo.
             - Valida la contraseña y que el email ingresado coincida con el registrado.
             - Envía un correo de confirmación al usuario con los datos del dispositivo e IP.
             - Establece una clave temporal en Redis para bloquear el login por 30 minutos.
             - Registra la solicitud de eliminación en el log de auditoría.

            Args:
            session (Session): Sesión activa de SQLAlchemy.
            usuario_id (int): ID del usuario que solicita la eliminación.
            email_data (str): Correo electrónico provisto para verificación.
            password (str): Contraseña del usuario para autenticar la acción.
            user_agent (str): User-Agent del navegador o aplicación que solicita la eliminación.
            ip_solicitud (str): Dirección IP desde la cual se hace la solicitud.
            jti (str): Identificador único del token de acceso actual.
            jti_refresh (str): Identificador único del token de refresh actual.

            Returns:
             dict: Tupla con:
             - ResponseStatus: Estado de la operación.
             - str: Mensaje descriptivo.
             - Optional[dict]: Información adicional o None.
             - int: Código HTTP asociado.
            """
            try:
                usuario = session.query(Usuario).filter_by(id_usuario=usuario_id,eliminado=False).first()
                if not usuario:
                    return ResponseStatus.FAIL, "Usuario no encontrado", None, 404
                
                if not check_password_hash(usuario.password, password):
                    return (
                        ResponseStatus.UNAUTHORIZED,
                        "Contraseña incorrecta",
                        None,
                        400,
                    )                         

                if email_data != usuario.email_usuario:
                    
                    return (
                        ResponseStatus.FAIL,
                        "El email debe ser el mismo del usuario.",
                        None,
                        400,
                    )

                enviar_email_confirmacion_eliminacion(usuario, user_agent, ip_solicitud, jti, jti_refresh)

                # Bloquear el login por 30 minutos
                get_redis().setex(f"eliminacion_pendiente:{usuario_id}", 60 * 30, "1")

                #Se crea un log de la solicitud solo por si no fue el mismo usuario el que la pidio para tener un registro.
                log_usuario_accion(session, usuario_id, "solicitar_eliminacion")

                return ResponseStatus.SUCCESS, "Se envió un email al correo para verificar su eliminación de cuenta.", None, 200

            except Exception as e:
                session.rollback()
                raise e

    # -----------------------------------------------------------------------------------------------------------------------------

    def eliminar_usuario(self, session:Session, usuario_id: int):
        """
        Elimina lógicamente un usuario del sistema.

        Esta operación marca al usuario como eliminado en la base de datos,
        sin borrar sus registros físicos. Además, se notifica al microservicio
        `persona-service` para desvincular los datos relacionados.

        Args:
         session (Session): Objeto de sesión de SQLAlchemy.
         usuario_id (int): ID del usuario a eliminar.

        Returns:
          dict: Tupla con estado (ResponseStatus), mensaje y código HTTP.

        Raise:
          Exception: Si ocurre un error al enviar el evento al microservicio o al realizar el commit.
    """
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id).first()

        if not usuario:
            return ResponseStatus.FAIL, "Usuario no encontrado", None, 404

        if usuario.eliminado:
            return ResponseStatus.FAIL, "El usuario ya fue eliminado", None, 400
        self.delete(usuario_id, soft=True, session=session)

        try:
            send_message(
                to_service="persona-service",
                message={
                    "id_usuario": usuario.id_usuario,
                    "email": usuario.email_usuario,
                },
                event_type="auth_user_unlink",
            )
        except Exception as e:
            session.rollback()
            raise e
        log_usuario_accion(session, usuario_id, "confirmar_eliminacion")
        return ResponseStatus.SUCCESS, "Usuario eliminado correctamente", None, 200
    # -----------------------------------------------------------------------------------------------------------------------------
    
    def logout_usuario(self, session: Session, usuario_id: int, jwt_jti: str, refresh_jti: str) -> dict:
        """
        Finaliza la sesión del usuario revocando los tokens activos.

        Elimina el access token (JWT) de Redis y revoca el token de refresco
        para impedir su reutilización. También registra la acción en el log de auditoría.

        Args:
         session (Session): Objeto de sesión de SQLAlchemy.
         usuario_id (int): ID del usuario que realiza el logout.
         jwt_jti (str): Identificador único del access token JWT.
         refresh_jti (str): Identificador único del refresh token.

        Returns:
         dict: Tupla con estado (ResponseStatus), mensaje y código HTTP.

        Raise:
         Exception: No se lanza directamente pero podrían producirse errores en operaciones con Redis o sesión.
        """
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id,eliminado=False).first()
        if not usuario:
            return ResponseStatus.NOT_FOUND, "Usuario no encontrado", None, 404



        # Limpiar redis
        get_redis().delete(jwt_jti)
        revocar_refresh_token(refresh_jti)
        log_usuario_accion(session, usuario_id, "Logout exitoso", f"Email: {usuario.email_usuario}")
        return ResponseStatus.SUCCESS, "Logout exitoso.", None, 200

    # -----------------------------------------------------------------------------------------------------------------------------
    # RECUPERACION DE PASSWORD CON CODIGO OTP VIA MAIL
    # -----------------------------------------------------------------------------------------------------------------------------

    def solicitar_codigo_reset(self, session: Session, email: str) -> dict:
        """
        Inicia el proceso de recuperación de contraseña enviando un código OTP al email.

        Si el email pertenece a un usuario registrado y no eliminado, genera un código OTP,
        lo guarda temporalmente en Redis y lo envía por correo electrónico al usuario.

        Args:
         session (Session): Objeto de sesión de SQLAlchemy.
         email (str): Dirección de correo electrónico del usuario.

        Returns:
         dict: Tupla con estado (ResponseStatus), mensaje, datos (None) y código HTTP.

        Raises:
         Exception: Capturada y devuelta como error 500 en caso de problemas internos.
        """

        try:
            usuario = session.query(Usuario).filter_by(email_usuario=email,eliminado=False).first()
            if not usuario:
                return ResponseStatus.FAIL, "Email no registrado", None, 404

            otp = generar_codigo_otp()
            guardar_otp(email, otp)
            enviar_codigo_reset_por_email(usuario, otp)

            return ResponseStatus.SUCCESS, "Código OTP enviado al correo", None, 200
        
        except Exception as e:
            return ResponseStatus.ERROR, "Error interno al solicitar código", None, 500

    def verificar_otp(self, session: Session, email: str, otp: str) -> dict:
        """
        Verifica el código OTP recibido para recuperación de contraseña.

        Si el código es válido, genera un token de recuperación temporal y lo almacena en Redis
        para permitir el cambio de contraseña posteriormente.

        Args:
         session (Session): Objeto de sesión de SQLAlchemy.
         email (str): Dirección de correo electrónico del usuario.
         otp (str): Código de verificación OTP recibido por el usuario.

        Returns:
         dict: Tupla con estado (ResponseStatus), mensaje, datos con el token de reset y código HTTP.

        Raise:
         Exception: Capturada y devuelta como error 500 si ocurre algún fallo al generar o guardar el token.
        """

        resultado = verificar_otp_redis(email, otp)
        if not resultado:
            return ResponseStatus.FAIL, "Código OTP inválido o expirado", None, 400
        try:
            token = generar_token_reset(email)
            guardar_token_recuperacion(email, token)

            return ResponseStatus.SUCCESS, "OTP válido", {"reset_token": token}, 200
        except Exception as e:
            return ResponseStatus.ERROR, "Error interno al solicitar código", str(e), 500

    """def verificar_otp(self, session: Session, email: str, otp: str) -> dict:
        try:
            resultado = verificar_otp_redis(email, otp)
            estado = resultado.get("estado")

            # Debug (opcional): logea el resultado de Redis
            print(f"[DEBUG] OTP verificación Redis → {resultado}")

            if estado == "valido":
                token = generar_token_reset(email)
                guardar_token_recuperacion(email, token)
                return ResponseStatus.SUCCESS, "OTP válido", {"reset_token": token}, 200

            elif estado == "expirado":
                return ResponseStatus.FAIL, "El código OTP ha expirado", None, 400

            elif estado == "bloqueado":
                return ResponseStatus.FAIL, "Demasiados intentos fallidos. Solicita uno nuevo.", None, 429

            elif estado == "invalido":
                intentos_restantes = resultado.get("intentos_restantes", 0)
                return (
                    ResponseStatus.FAIL,
                    f"Código incorrecto. Intentos restantes: {intentos_restantes}",
                    {"intentos_restantes": intentos_restantes},
                    400
                )

            # Estado desconocido, potencial bug interno
            return ResponseStatus.ERROR, "Error desconocido al verificar OTP", None, 500

        except Exception as e:
            import traceback
            traceback.print_exc()
            return ResponseStatus.ERROR, "Error interno al solicitar código", None, 500"""

    def cambiar_password_con_codigo(self, session: Session, data: dict, token: str, email: str) -> dict:
        """
        Cambia la contraseña del usuario utilizando un token válido de recuperación.

        Valida los datos de entrada (incluyendo coincidencia de contraseñas),
        verifica que el token corresponda al email recibido y que no esté expirado.
        Si es válido, actualiza la contraseña del usuario, asegurando que no sea igual a la anterior.

        Args:
         session (Session): Objeto de sesión de SQLAlchemy.
         data (dict): Diccionario con la nueva contraseña (debe incluir confirmación).
         token (str): Token de recuperación previamente generado y enviado por email.
         email (str): Email del usuario que desea cambiar la contraseña.

        Returns:
         dict: Tupla con estado (ResponseStatus), mensaje, datos (None) y código HTTP.

        Raise:
         ValidationError: Si las contraseñas no coinciden o los datos no son válidos.
         Exception: Si ocurre un error inesperado al guardar los cambios.
        """
        try:
            data_validada = self.schema_reset.load(data)
        except ValidationError as error:
            return (
                ResponseStatus.FAIL,
                "Las contraseñas deben coincidir",
                error.messages,
                400,
            )

        email_redis = verificar_token_recuperacion(token)
        if not email_redis or email != email_redis:
            return ResponseStatus.FAIL, "Token inválido o expirado", None, 400

        nueva_pass = data_validada.get("confirm_password")
        if not nueva_pass:
            return ResponseStatus.FAIL, "Contraseña nueva requerida", None, 400

        usuario = session.query(Usuario).filter_by(email_usuario=email,eliminado=False).first()
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
        log_usuario_accion(session, usuario.id_usuario, "Modificacion_password_exitosa")
        return ResponseStatus.SUCCESS, "Contraseña actualizada correctamente", None, 200


    def refresh_token(self, session: Session, usuario_id: int) -> dict:
        """
        Genera un nuevo access token para el usuario a partir de su ID, utilizando sus roles y permisos actuales.

        Este método consulta la base de datos para obtener el rol y los permisos asociados al usuario,
        genera un nuevo token de acceso (access_token) y almacena sus permisos temporalmente en Redis,
        utilizando el identificador único del token (jti) como clave.

        Args:
         session (Session): Objeto de sesión de SQLAlchemy.
         usuario_id (int): ID del usuario autenticado.
 
        Returns:
         dict: Diccionario con el nuevo access_token y su jti asociado. En caso de error al registrar en Redis, se retorna un string con el mensaje de error.

        """
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id,eliminado=False).first()
        if not usuario:
            return None

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
            identity=str(usuario_id),
            additional_claims={
                "sub": str(usuario.id_usuario),
                "email": usuario.email_usuario,
                "rol": rol_nombre,
                "permisos": permisos,
            },
        )

        # Decodificar el token para obtener jti y expiración
        access_decoded = decode_token(nuevo_access_token)
        access_jti = access_decoded["jti"]
        access_exp = datetime.fromtimestamp(access_decoded["exp"], tz=timezone.utc)
        ttl = int((access_exp - datetime.now(timezone.utc)).total_seconds())

        # Guardar en Redis
        try:
            get_redis().rpush(access_jti, *permisos)
            get_redis().expire(access_jti, ttl)
        except Exception as e:
            return (f"[!] Error al registrar access token en Redis: {e}")
        
        usuario_data = self.schema_out.dump(usuario)

        usuario_data["token"] = nuevo_access_token  # es el access token
        usuario_data["expires_in"] = access_exp 
        usuario_data["rol"] = roles_nombres

        return usuario_data

    def rotar_refresh_token(self, session: Session, payload: str) -> dict:
        """
        Rota el refresh token del usuario, generando uno nuevo y revocando el anterior.

        Este método se utiliza cuando el usuario solicita un nuevo token de acceso y refresh.
        Primero revoca el refresh token anterior (identificado por el `jti` en el payload),
        luego genera un nuevo refresh token, lo registra en Redis, y finalmente invoca el método
        `refresh_token` para generar un nuevo access token con los permisos actualizados.

        Args:
         session (Session): Objeto de sesión de SQLAlchemy.
         payload (str): Payload decodificado del JWT actual, que contiene el `jti` y el `sub` (usuario_id).

        Returns:
         dict: Tupla con estado (`ResponseStatus`), mensaje, diccionario con los nuevos tokens y código HTTP.
               En caso de error (usuario no encontrado), se retorna un mensaje de error y código 404.
        """
        # Revocar el refresh token anterior
        jti_viejo = payload["jti"]
        revocar_refresh_token(jti_viejo)

        # Crear nuevo refresh token
        usuario_id = int(payload["sub"])
        nuevo_refresh_token, refresh_expires, jti_nuevo = crear_token_refresh(usuario_id)
        registrar_refresh_token(jti_nuevo, refresh_expires)

        tokens = self.refresh_token(session, usuario_id)
        if tokens is None:
            return (
                ResponseStatus.FAIL,
                "Usuario no encontrado",
                None,
                404
        )

        tokens["refresh_token"] = nuevo_refresh_token
        tokens["refresh_jti"] = jti_nuevo

        return (
            ResponseStatus.SUCCESS,
            "Nuevo token generado exitosamente.",
            tokens,
            200
        )