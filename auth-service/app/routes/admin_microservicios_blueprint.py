from flask import Blueprint

admin_micro_bp = Blueprint('admin_microservicios', __name__)

"""
Blueprint: admin_microservicios

Este módulo expone endpoints administrativos para gestionar usuarios
desde otros microservicios con permisos elevados (admin local).

Incluye operaciones de:
- Creación de usuario
- Modificación y eliminación lógica
- Asignación de roles
- Reseteo de contraseña por parte de un administrador

Importante:
Este Blueprint está pensado para uso interno por parte de otros
microservicios o interfaces de administración, no para clientes públicos.
"""

@admin_micro_bp.route('/usuarios', methods=['POST'])
def crear_usuario_microservicio():
    """
    Crea un nuevo usuario desde un microservicio con rol administrador.

    Este endpoint se usa cuando un servicio externo (por ejemplo, el panel
    administrativo) necesita crear un usuario directamente.

    Requiere:
        - JSON con datos del usuario (nombre, email, password, etc.)

    Returns:
        - Resultado del proceso de creación.
    """
    pass

@admin_micro_bp.route('/usuarios/<int:usuario_id>', methods=['PUT'])
def modificar_usuario_microservicio(usuario_id):
    """
    Modifica los datos de un usuario específico desde otro microservicio.

    Args:
        usuario_id (int): ID del usuario a modificar.

    Requiere:
        - JSON con los nuevos datos del usuario.

    Returns:
        - Resultado del proceso de modificación.
    """
    pass

@admin_micro_bp.route('/usuarios/<int:usuario_id>', methods=['DELETE'])
def eliminar_usuario_microservicio(usuario_id):
    """
    Realiza un borrado lógico del usuario (marca como eliminado).

    Args:
        usuario_id (int): ID del usuario a eliminar.

    Funcionalidad:
        - No elimina físicamente el registro.
        - Marca los campos `eliminado=True` y `deleted_at` con la fecha actual.

    Returns:
        - Resultado de la operación.
    """
    pass

@admin_micro_bp.route('/usuarios/<int:usuario_id>/roles', methods=['POST'])
def asignar_roles_usuario_microservicio(usuario_id):
    """
    Asigna uno o varios roles a un usuario dentro del contexto del microservicio.

    Args:
        usuario_id (int): ID del usuario.

    Requiere:
        - JSON con una lista de roles a asignar.

    Returns:
        - Resultado de la asignación de roles.
    """
    pass

@admin_micro_bp.route('/usuarios/<int:usuario_id>/reset_password', methods=['POST'])
def resetear_password_usuario(usuario_id):
    """
    Resetea la contraseña de un usuario por parte del administrador.

    Args:
        usuario_id (int): ID del usuario.

    Requiere:
        - JSON con nueva contraseña u otros datos necesarios.

    Returns:
        - Resultado del reseteo.
    """
    pass
