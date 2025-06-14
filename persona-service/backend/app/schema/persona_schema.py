from marshmallow import Schema, fields, validate
from config import TIPOS_DOCUMENTO_VALIDOS
from app.schema.contacto_schema import ContactoSchema
from app.schema.domicilio_schema import DomicilioSchema
from app.schema.persona_extendida_schema import PersonaExtendidaSchema

class PersonaSchema(Schema):
    id_persona=fields.Int(dump_only=True)
    nombre_persona=fields.Str(required=True)
    apellido_persona=fields.Str(required=True)
    fecha_nacimiento_persona=fields.Date(required=True)
    tipo_documento = fields.Str(required=True, validate=validate.OneOf(TIPOS_DOCUMENTO_VALIDOS))
    num_doc_persona=fields.Str(required=True)

    usuario_id=fields.Int(required=False)
    
    persona_extendida=fields.Nested(PersonaExtendidaSchema, required=False, allow_none=True)
    domicilio=fields.Nested(DomicilioSchema, required=True)
    contacto=fields.Nested(ContactoSchema, required=True)

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)


class PersonaResumidaSchema(Schema):
    id_persona=fields.Int(dump_only=True)
    nombre_persona=fields.Str(required=True)
    apellido_persona=fields.Str(required=True)
    fecha_nacimiento_persona=fields.Date(required=True)
    tipo_documento = fields.Str(required=True, validate=validate.OneOf(TIPOS_DOCUMENTO_VALIDOS))
    num_doc_persona=fields.Str(required=True)
    usuario_id=fields.Int(required=False)
