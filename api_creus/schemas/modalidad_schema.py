from marshmallow import Schema, fields

class ModalidadSchema(Schema):
    id = fields.Int()
    nombre = fields.Str()
    observaciones = fields.Str(allow_none=True)
