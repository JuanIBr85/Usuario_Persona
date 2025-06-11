from marshmallow import Schema, fields
from app.schema.persona_schema import PersonaSchema

class PersonaExtendidaSchema(PersonaSchema):

    estado_civil = fields.Str()
    ocupacion = fields.Str()
    vencimiento_dni = fields.Date(required=True)
    foto_perfil = fields.Str()
