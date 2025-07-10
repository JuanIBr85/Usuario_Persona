from flask import Blueprint, Response, request, current_app,render_template
import json
from app.database.session import SessionLocal
from app.services.superadmin_service import SuperAdminService
from common.decorators.api_access import api_access
from common.models.cache_settings import CacheSettings
from app.models import Usuario
from common.utils.response import make_response, ResponseStatus
from app.utils.jwt import generar_token_confirmacion_usuario,verificar_token_restauracion
from app.utils.email import enviar_mail_confirmacion_usuario
from jwt import ExpiredSignatureError,InvalidTokenError

superadmin_bp = Blueprint("admin", __name__)

superadmin_service = SuperAdminService()

"""
Blueprint: admin

Este módulo contiene los endpoints de administración avanzada del sistema.
Está destinado a ser utilizado por usuarios con permisos de superadministrador.

Permite realizar operaciones como:
- Crear y modificar usuarios con rol
- Crear, modificar, borrar y obtener roles
- Crear y obtener permisos
- Asignar permisos a roles
- Obtener usuarios (activos o eliminados)
- Restaurar usuarios eliminados (por token)
"""


# ======================
# crear usuario con rol
# ======================
@superadmin_bp.route("/admins", methods=["POST"])
@api_access(
    is_public=False,
    limiter=["5 per minute"],
    access_permissions=["auth.admin.crear_usuario_con_rol"],
)
def crear_usuario_con_rol():
    """
    Crea un nuevo usuario con un rol asignado.

    Args:
        JSON con nombre_usuario, email_usuario, password y rol.

    Returns:
        - 201 si se crea correctamente.
        - 400 si faltan datos o rol inválido.
        - 500 si ocurre un error inesperado.
    """
    session = SessionLocal()
    try:
        data = request.get_json()
        nombre = data.get("nombre_usuario")
        email = data.get("email_usuario")
        password = data.get("password")
        nombre_rol = data["rol"]

        if not nombre or not email or not password:
            return Response(
                json.dumps({"error": "Faltan campos requeridos."}),
                status=400,
                mimetype="application/json",
            )

        resultado = superadmin_service.crear_usuario_con_rol(
            session, nombre, email, password, nombre_rol
        )

        return Response(json.dumps(resultado), status=201, mimetype="application/json")

    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}), status=400, mimetype="application/json"
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype="application/json",
        )
    finally:

        session.close()


# ==========
# Crear rol
# ==========
@superadmin_bp.route("/roles", methods=["POST"])
@api_access(
    is_public=False,
    limiter=["5 per minute"],
    access_permissions=["auth.admin.crear_rol"],
)
def crear_rol():
    """
    Crea un nuevo rol en el sistema.

    Args:
        JSON con nombre_rol.

    Returns:
        - 201 si se crea correctamente.
        - 400 si faltan datos.
        - 500 si ocurre un error inesperado.
    """
    session = SessionLocal()
    try:
        data = request.get_json()
        nombre_rol = data.get("nombre_rol")

        if not nombre_rol:
            raise ValueError("Debe proporcionar un nombre para el rol.")

        resultado = superadmin_service.crear_rol(session, nombre_rol)

        return Response(json.dumps(resultado), status=201, mimetype="application/json")

    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}), status=400, mimetype="application/json"
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype="application/json",
        )
    finally:
        session.close()


# Asignar permisos a rol (Si, "reemplaza" los permisos que no se asignan, esto es aproposito para funcionar con los checkbox del front)
@superadmin_bp.route("/admins/permisos/<int:id>", methods=["POST"])
@api_access(
    is_public=False,
    limiter=["5 per minute"],
    access_permissions=["auth.admin.asignar_permisos_rol"],
)
def asignar_permisos_rol(id):
    """
    Asigna una lista de permisos a un rol específico (reemplaza los anteriores).

    Args:
        id (int): ID del rol a modificar.
        JSON con lista de permisos.

    Returns:
        - 200 si se asignan correctamente.
        - 400 si faltan datos o formato inválido.
        - 500 si ocurre un error inesperado.
    """
    session = SessionLocal()
    try:
        data = request.get_json()
        permisos = data.get("permisos")
        if not permisos or not isinstance(permisos, list):
            return Response(
                json.dumps({"error": "Se requiere una lista de permisos."}),
                status=400,
                mimetype="application/json",
            )

        resultado = superadmin_service.asignar_permisos_rol(session, id, permisos)

        return Response(json.dumps(resultado), status=200, mimetype="application/json")

    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}), status=400, mimetype="application/json"
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype="application/json",
        )
    finally:
        session.close()


# ==========================
# Modificar usuarios con rol
# ==========================
@superadmin_bp.route("/usuarios/<int:id>", methods=["PUT"])
@api_access(
    is_public=False,
    limiter=["5 per minute"],
    access_permissions=["auth.admin.modificar_usuario_con_rol"],
)
def modificar_usuario_con_rol(id):
    """
    Modifica los datos de un usuario y su rol asignado.

    Args:
        id (int): ID del usuario a modificar.
        JSON con datos actualizados.

    Returns:
        - 200 si se modifica correctamente.
        - 400 si faltan datos.
        - 404 si el usuario no existe.
        - 500 si ocurre un error inesperado.
    """
    session = SessionLocal()
    try:
        data = request.get_json()
        if not data:
            return Response(
                json.dumps({"error": "Se requieren datos para modificar el usuario."}),
                status=400,
                mimetype="application/json",
            )

        resultado = superadmin_service.modificar_usuario_con_rol(session, id, data)

        return Response(json.dumps(resultado), status=200, mimetype="application/json")

    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}), status=400, mimetype="application/json"
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype="application/json",
        )
    finally:
        session.close()


# =============
# Modificar rol
# =============
@superadmin_bp.route("/roles/<int:rol_id>", methods=["PUT"])
@api_access(
    is_public=False,
    limiter=["5 per minute"],
    access_permissions=["auth.admin.modificar_rol"],
)
def modificar_rol(rol_id):
    """
    Modifica el nombre u atributos de un rol existente.

    Args:
        rol_id (int): ID del rol a modificar.

    Returns:
        - 200 si se modifica correctamente.
        - 400 si los datos son inválidos.
        - 500 si ocurre un error inesperado.
    """
    return Response(
        json.dumps({"mensaje": f"Rol {rol_id} modificado "}),
        status=200,
        mimetype="application/json",
    )


# ==============
# Crear permiso
# ==============
@superadmin_bp.route("/permisos", methods=["POST"])
@api_access(
    is_public=False,
    limiter=["5 per minute"],
    access_permissions=["auth.admin.crear_permiso"],
)
def crear_permiso():
    """
    Crea un nuevo permiso en el sistema.

    Args:
        JSON con nombre del permiso.

    Returns:
        - 201 si se crea correctamente.
        - 400 si faltan datos.
    """
    return Response(
        json.dumps({"mensaje": "Permiso creado "}),
        status=201,
        mimetype="application/json",
    )


# =============
# obtener roles
# =============
@superadmin_bp.route("/roles", methods=["GET"])
@api_access(
    is_public=False,
    limiter=["10 per minute"],
    access_permissions=["auth.admin.obtener_roles"],
    cache=CacheSettings(expiration=5),
)
def obtener_roles():
    """
    Obtiene la lista de roles disponibles en el sistema.

    Returns:
        - 200 con la lista de roles.
        - 500 si ocurre un error inesperado.
    """
    session = SessionLocal()
    try:
        roles = superadmin_service.obtener_roles(session)
        return Response(json.dumps(roles), status=200, mimetype="application/json")
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error al obtener roles: {str(e)}"}),
            status=500,
            mimetype="application/json",
        )
    finally:
        session.close()


# ===========
# borrar rol
# ===========
@superadmin_bp.route("/roles/<int:rol_id>", methods=["DELETE"])
@api_access(
    is_public=False,
    limiter=["5 per minute"],
    access_permissions=["auth.admin.borrar_rol"],
)
def borrar_rol(rol_id):
    """
    Elimina lógicamente un rol del sistema.

    Args:
        rol_id (int): ID del rol a eliminar.

    Returns:
        - 200 si se elimina correctamente.
        - 404 si no se encuentra.
        - 500 si ocurre un error inesperado.
    """
    session = SessionLocal()
    try:
        resultado = superadmin_service.borrar_rol(session, rol_id)
        return Response(json.dumps(resultado), status=200, mimetype="application/json")
    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}), status=400, mimetype="application/json"
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype="application/json",
        )
    finally:
        session.close()


# =================
# obtener permisos
# =================
@superadmin_bp.route("/permisos", methods=["GET"])
@api_access(
    is_public=False,
    limiter=["10 per minute"],
    access_permissions=["auth.admin.obtener_permisos"],
    cache=CacheSettings(expiration=10),
)
def obtener_permisos():
    """
    Obtiene todos los permisos registrados en el sistema.

    Returns:
        - 200 con la lista de permisos.
        - 500 si ocurre un error inesperado.
    """
    session = SessionLocal()
    try:
        resultado = superadmin_service.obtener_permisos(session)
        return Response(json.dumps(resultado), status=200, mimetype="application/json")
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error al obtener permisos: {str(e)}"}),
            status=500,
            mimetype="application/json",
        )
    finally:
        session.close()

# =====================
# obtener todos usuarios
# =====================
@superadmin_bp.route("/usuarios", methods=["GET"])
@api_access(
    is_public=False,
    limiter=["25 per minute"],
    access_permissions=["auth.admin.obtener_usuarios"],
    cache=CacheSettings(expiration=10),
)
def obtener_usuarios():
    """
    Obtiene la lista de usuarios activos (no eliminados).

    Returns:
        - 200 con la lista de usuarios.
        - 500 si ocurre un error inesperado.
    """
    session = SessionLocal()
    try:
        usuarios = superadmin_service.obtener_usuarios(session, solo_eliminados=False)
        return Response(json.dumps(usuarios), status=200, mimetype="application/json")
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error al obtener usuarios: {str(e)}"}),
            status=500,
            mimetype="application/json",
        )
    finally:
        session.close()

# ========================================
# obtener todos los usuarios eliminados
# ========================================
@superadmin_bp.route("/usuarios-eliminados", methods=["GET"])
@api_access(
    is_public=False, 
    limiter=["3 per minute"],
    access_permissions=["auth.admin.obtener_usuarios_eliminados"],
    cache=CacheSettings(expiration=10),
)
def ver_usuarios_eliminados():
    """
    Obtiene la lista de usuarios que han sido eliminados lógicamente.

    Returns:
        - 200 con la lista de usuarios eliminados.
        - 500 si ocurre un error inesperado.
    """
    session = SessionLocal()
    try:
        usuarios = superadmin_service.obtener_usuarios(session, solo_eliminados=True)
        return make_response(ResponseStatus.SUCCESS, data=usuarios)
    except Exception as e:
        return make_response(ResponseStatus.ERROR,"Error al cargar los usuarios eliminados",str(e),500)
    finally:
        session.close()
        
# =============================
# Restaurar Usuario
# =============================
@superadmin_bp.route("/restaurar-usuario", methods=["GET"])
@api_access(
    is_public=True,
    limiter=["3 per minute"],
    access_permissions=["auth.admin.restaurar_usuario"],
    cache=CacheSettings(expiration=600, params=["token"]),
    )
def restaurar_usuario_desde_token():
    """
    Restaura un usuario eliminado utilizando un token enviado por email.

    Query Params:
        - token: token JWT de restauración

    Returns:
        - 200 si se envía el correo de confirmación al usuario.
        - 400 si el token es inválido o ha expirado.
        - 404 si el usuario no existe.
    """
    session = SessionLocal()
    token = request.args.get("token")
    try:
        email = verificar_token_restauracion(token, tipo="restauracion_admin")
        if not email:
            return render_template("token_invalido.html"), 400

        usuario = session.query(Usuario).filter_by(email_usuario=email, eliminado=True).first()

        if not usuario:
            return render_template("usuario_no_encontrado.html"), 404

        # 1) Generar nuevo token para que el usuario confirme
        token_usuario = generar_token_confirmacion_usuario(email)
        enlace_usuario = f"{current_app.config['USER_RESTORE_CONFIRM_URL']}?token={token_usuario}"

        # 2) Enviar mail de confirmación al usuario
        enviar_mail_confirmacion_usuario(usuario, enlace_usuario)

        return render_template("correo_enviado_confirmacion.html", email=email), 200

    except ExpiredSignatureError:
        return "El enlace ha expirado.", 400
    except InvalidTokenError:
        return "Token inválido.", 400
    finally:
        session.close()


