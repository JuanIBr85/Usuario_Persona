from flask import Blueprint, Response, request
import json
from app.database.session import SessionLocal
from app.services.superadmin_service import SuperAdminService
from flask_jwt_extended import jwt_required

superadmin_bp = Blueprint('admin', __name__)

superadmin_service = SuperAdminService()


@superadmin_bp.route('/admins', methods=['POST'])
@jwt_required()
def crear_usuario_con_rol():
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
                mimetype='application/json'
            )

        resultado = superadmin_service.crear_usuario_con_rol(
            session, nombre, email, password, nombre_rol)

        return Response(
            json.dumps(resultado),
            status=201,
            mimetype='application/json'
        )

    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}),
            status=400,
            mimetype='application/json'
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )
    finally:

        session.close()


crear_usuario_con_rol._security_metadata = {
    "is_public": False,
    "access_permissions": ["crear_usuario_con_rol"]
}

# Crear rol
@superadmin_bp.route('/roles', methods=['POST'])
def crear_rol():
    session = SessionLocal()
    try:
        data = request.get_json()
        nombre_rol = data.get("nombre_rol")

        if not nombre_rol:
            raise ValueError("Debe proporcionar un nombre para el rol.")

        resultado = superadmin_service.crear_rol(session, nombre_rol)

        return Response(
            json.dumps(resultado),
            status=201,
            mimetype='application/json'
        )

    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}),
            status=400,
            mimetype='application/json'
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )
    finally:
        session.close()

crear_rol._security_metadata = {
    "is_public": False,
    "access_permissions": [crear_rol]
}




# Asignar permisos a rol
@superadmin_bp.route('/admins/<int:id>/permisos', methods=['POST'])
def asignar_permisos_rol(id):
    session = SessionLocal()
    try:
        data = request.get_json()
        permisos = data.get("permisos")
        if not permisos or not isinstance(permisos, list):
            return Response(
                json.dumps({"error": "Se requiere una lista de permisos."}),
                status=400,
                mimetype='application/json'
            )

        resultado = superadmin_service.asignar_permisos_rol(
            session, id, permisos)

        return Response(
            json.dumps(resultado),
            status=200,
            mimetype='application/json'
        )

    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}),
            status=400,
            mimetype='application/json'
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )
    finally:
        session.close()

asignar_permisos_rol._security_metadata = {
    "is_public": False,
    "access_permissions": ["asignar_permisos_rol"]
}


# Modificar usuarios con rol


@superadmin_bp.route('/admins/<int:id>', methods=['PUT'])
def modificar_usuario_con_rol(id):
    session = SessionLocal()
    try:
        data = request.get_json()
        permisos = data.get("permisos")
        if not permisos or not isinstance(permisos, list):
            return Response(
                json.dumps({"error": "Se requiere una lista de permisos."}),
                status=400,
                mimetype='application/json'
            )

        resultado = superadmin_service.asignar_permisos_admin(
            session, id, permisos)

        return Response(
            json.dumps(resultado),
            status=200,
            mimetype='application/json'
        )

    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}),
            status=400,
            mimetype='application/json'
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )
    finally:
        session.close()


modificar_usuario_con_rol._security_metadata = {
    "is_public": False,
    "access_permissions": ["modificar_admin"]
}

# Modificar rol


@superadmin_bp.route('/roles/<int:rol_id>', methods=['PUT'])
def modificar_rol(rol_id):
    return Response(
        json.dumps({"mensaje": f"Rol {rol_id} modificado "}),
        status=200,
        mimetype='application/json'
    )


modificar_rol._security_metadata = {
    "is_public": False,
    "access_permissions": ["modificar_rol"]
}

# Crear permiso


@superadmin_bp.route('/permisos', methods=['POST'])
def crear_permiso():
    return Response(
        json.dumps({"mensaje": "Permiso creado "}),
        status=201,
        mimetype='application/json'
    )

# --- Debugging ---
crear_permiso._security_metadata = {
    "is_public": False,
    "access_permissions": [crear_permiso]
}

# ==========
# ==========
@superadmin_bp.route('/roles', methods=['GET'])
def obtener_roles():
    session = SessionLocal()
    try:
        roles = superadmin_service.obtener_roles(session)
        return Response(
            json.dumps(roles),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error al obtener roles: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )
    finally:
        session.close()

# --- Debugging --- 
obtener_roles._security_metadata = {
    "is_public": False,
    "access_permissions": [obtener_roles]
}

@superadmin_bp.route('/roles/<int:rol_id>', methods=['DELETE'])
# --- Debugging --- 
# @jwt_required()
def borrar_rol(rol_id):
    session = SessionLocal()
    try:
        resultado = superadmin_service.borrar_rol(session, rol_id)
        return Response(
            json.dumps(resultado),
            status=200,
            mimetype='application/json'
        )
    except ValueError as e:
        session.rollback()
        return Response(
            json.dumps({"error": str(e)}),
            status=400,
            mimetype='application/json'
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error inesperado: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )
    finally:
        session.close()

borrar_rol._security_metadata = {
    "is_public": False,
    "access_permissions": [borrar_rol]
}


@superadmin_bp.route('/permisos', methods=['GET'])
def obtener_permisos():
    session = SessionLocal()
    try:
        resultado = superadmin_service.obtener_permisos(session)
        return Response(
            json.dumps(resultado),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error al obtener permisos: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )
    finally:
        session.close()

obtener_permisos._security_metadata = {
    "is_public": False, 
    "access_permissions": [obtener_permisos]  
}

# ==========
# ==========