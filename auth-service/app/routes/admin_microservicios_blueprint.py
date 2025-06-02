from flask import Blueprint

admin_micro_bp = Blueprint('admin_microservicios', __name__)

@admin_micro_bp.route('/usuarios', methods=['POST'])
def crear_usuario_microservicio():
    # Crear usuario en contexto de microservicio (por un admin local)
    pass

@admin_micro_bp.route('/usuarios/<int:usuario_id>', methods=['PUT'])
def modificar_usuario_microservicio(usuario_id):
    # Modificar usuario desde el microservicio
    pass

@admin_micro_bp.route('/usuarios/<int:usuario_id>', methods=['DELETE'])
def eliminar_usuario_microservicio(usuario_id):
    # Borrado lógico del usuario
    pass

@admin_micro_bp.route('/usuarios/<int:usuario_id>/roles', methods=['POST'])
def asignar_roles_usuario_microservicio(usuario_id):
    # Asignar roles disponibles dentro del contexto del microservicio
    pass

@admin_micro_bp.route('/usuarios/<int:usuario_id>/reset_password', methods=['POST'])
def resetear_password_usuario(usuario_id):
    # Resetear password de usuario por parte del admin local
    pass
