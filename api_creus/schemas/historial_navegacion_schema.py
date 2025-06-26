from marshmallow import Schema, fields, validate

class HistorialNavegacionSchema(Schema):
    id = fields.Int(dump_only = True)
    id_usuario = fields.Int()
    id_propuesta_academica = fields.Int()
    fecha_hora_visita = fields.DateTime()

