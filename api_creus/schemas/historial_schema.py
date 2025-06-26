from marshmallow import Schema, fields, validate

class HistorialSchema(Schema):
    id = fields.Int()
    id_registro = fields.Int()
    nombre_tabla = fields.Str()
    fecha_hora = fields.DateTime()
    accion = fields.Str()
    id_usuario = fields.Int()
    observaciones = fields.Str()
