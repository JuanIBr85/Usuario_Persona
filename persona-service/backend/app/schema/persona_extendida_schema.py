from marshmallow import Schema, fields,validate
from config import ESTADO_CIVIL,ESTUDIOS_ALCANZADOS,OCUPACION

class PersonaExtendidaSchema(Schema):

    id_extendida=fields.Int(dump_only=True)
    estado_civil = fields.Str(required=False,validate=validate.OneOf(ESTADO_CIVIL))
    ocupacion = fields.Str(required=False,validate=validate.OneOf(OCUPACION))
    estudios_alcanzados = fields.Str(required=False,validate=validate.OneOf(ESTUDIOS_ALCANZADOS))
    vencimiento_dni = fields.Date(required=False)
    foto_perfil = fields.Str(required=False)
