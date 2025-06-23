from marshmallow import Schema, fields, validate

class PreinscripcionSchema(Schema):
    id = fields.Int()
    id_usuario = fields.Int()
    id_cohorte = fields.Int()
    fecha_hora_preinscripcion = fields.DateTime()
    id_estado = fields.Int()
    observaciones = fields.Str()