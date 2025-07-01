from marshmallow import Schema, fields

class EstadoSchema(Schema):
    id = fields.Int()
    nombre = fields.Str()
    observaciones = fields.Str()
    activo = fields.Boolean()