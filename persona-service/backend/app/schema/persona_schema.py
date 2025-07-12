from marshmallow import fields, validate, post_load
from config import TIPOS_DOCUMENTO_VALIDOS
from app.schema.contacto_schema import ContactoSchema
from app.schema.domicilio_schema import DomicilioSchema
from app.schema.persona_extendida_schema import PersonaExtendidaSchema
from app.schema.base_schema import BaseSchema

class FormatoDocumentoSchema(BaseSchema):
    @post_load
    def format_num_doc_persona(self, data, **kwargs):
        """Formatea el número de documento según el tipo"""
        tipo_documento = data.get('tipo_documento')
        num_doc_persona = data.get('num_doc_persona', "")
        
        if tipo_documento in ["CUIL", "CUIT"] and len(num_doc_persona) == 11:
            # Formatear como XX-XXXXXXXX-X
            data['num_doc_persona'] = f"{num_doc_persona[:2]}-{num_doc_persona[2:10]}-{num_doc_persona[10:]}"
        
        return data


class PersonaSchema(FormatoDocumentoSchema):
    id_persona = fields.Int(dump_only=True)
    nombre_persona = fields.Str(required=True)
    apellido_persona = fields.Str(required=True)
    fecha_nacimiento_persona = fields.Date(required=True)
    tipo_documento = fields.Str(
        required=True, validate=validate.OneOf(list(TIPOS_DOCUMENTO_VALIDOS.keys()))
    )
    num_doc_persona = fields.Str(required=True)

    usuario_id = fields.Int(required=False, allow_none=True)

    persona_extendida = fields.Nested(PersonaExtendidaSchema, required=False)
    domicilio = fields.Nested(DomicilioSchema, required=True)
    contacto = fields.Nested(ContactoSchema, required=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    deleted_at = fields.DateTime(dump_only=True)

    


class PersonaResumidaSchema(FormatoDocumentoSchema):
    id_persona = fields.Int(dump_only=True)
    nombre_persona = fields.Str(required=True)
    apellido_persona = fields.Str(required=True)
    fecha_nacimiento_persona = fields.Date(required=True)
    tipo_documento = fields.Str(
        required=True, validate=validate.OneOf(list(TIPOS_DOCUMENTO_VALIDOS.keys()))
    )
    num_doc_persona = fields.Str(required=True)
    usuario_id = fields.Int(required=False)

