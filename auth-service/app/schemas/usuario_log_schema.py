from marshmallow import Schema, fields

"""
Schema: UsuarioLogSchema

Representa el log o historial de acciones realizadas por un usuario en el sistema.

Campos:
- id_log (int): Identificador único del log.
- usuario_id (int): ID del usuario que realizó la acción.
- accion (str): Tipo de acción registrada (por ejemplo: "CREAR_USUARIO", "MODIFICAR_ROL").
- detalles (str): Descripción detallada o información extra sobre la acción.
- logged_at (datetime): Fecha y hora exacta en que se registró la acción.
"""
class UsuarioLogSchema(Schema):
    id_log = fields.Int()
    usuario_id = fields.Int()
    accion = fields.Str()
    detalles = fields.Str()
    logged_at = fields.DateTime()