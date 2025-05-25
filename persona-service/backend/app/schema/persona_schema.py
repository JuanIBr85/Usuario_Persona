from marshmallow import Schema, fields
from app.schema.contacto_schema import ContactoSchema
from app.schema.domicilio_schema import DomicilioSchema
from app.schema.tipo_documento_schema import TipoDocumentoSchema

class PersonaSchema(Schema):
    id_persona=fields.Int(dump_only=False)
    nombre_persona=fields.Str(required=True)
    apellido_persona=fields.Str(required=True)
    fecha_nacimiento_persona=fields.Date(required=True)
    num_doc_persona=fields.Str(required=True)

    usuario_id=fields.Int(required=False)

    domicilio_id=fields.Int(required=False)
    tipo_documento_id=fields.Int(required=False)
    contacto_id=fields.Int(required=False)

    domicilio=fields.Nested(DomicilioSchema, dump_only=True)
    tipo_documento=fields.Nested(TipoDocumentoSchema, dump_only=True)
    contacto=fields.Nested(ContactoSchema, dump_only=True)

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)
