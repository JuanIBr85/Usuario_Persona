from flask import Blueprint

superadmin_bp = Blueprint('admin', __name__)

@superadmin_bp.route('/roles', methods=['POST'])
def crear_rol():
    # Crear un nuevo rol (solo superadmin)
    pass

@superadmin_bp.route('/roles/<int:rol_id>', methods=['PUT'])
def modificar_rol(rol_id):
    # Modificar rol existente
    pass

@superadmin_bp.route('/permisos', methods=['POST'])
def crear_permiso():
    # Crear nuevo permiso
    pass

@superadmin_bp.route('/roles/<int:rol_id>/permisos', methods=['POST'])
def asignar_permisos_a_rol(rol_id):
    # Asignar permisos a un rol
    pass

@superadmin_bp.route('/usuarios', methods=['POST'])
def crear_usuario_global():
    # Crear usuario desde contexto global (sin estar atado a un microservicio)
    pass

@superadmin_bp.route('/usuarios/<int:usuario_id>/roles', methods=['POST'])
def asignar_roles_a_usuario(usuario_id):
    # Asignar roles a un usuario (superadmin)
    pass