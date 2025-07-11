from marshmallow import Schema, fields

class UsuarioLogSchema(Schema):
    id_log = fields.Int()
    usuario_id = fields.Int()
    accion = fields.Str()
    detalles = fields.Str()
    logged_at = fields.DateTime()