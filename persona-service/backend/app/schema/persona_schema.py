from marshmallow import Schema, fields
from app.schema.contacto_schema import ContactoSchema
from app.schema.domicilio_schema import DomicilioShema
from app.schema.tipo_documento_schema import TipoDocumentoSchema

class PersonaSchema(Schema):
    id=fields.Int(dump_only=True)
    nombre=fields.Str(required=True)
    apellido=fields.Str(required=True)
    fecha_nacimiento=fields.Date(required=True)
    numero_documento=fields.Str(required=True)

    usuario_id=fields.Int(required=True)

    domicilio_id=fields.Int(required=True)
    tipo_documento_id=fields.Int(required=True)
    contacto_id=fields.Int(required=True)

    domicilio=fields.Nested(DomicilioShema, dump_only=True)
    tipo_documento=fields.Nested(TipoDocumentoSchema, dump_only=True)
    contacto=fields.Nested(ContactoSchema, dump_only=True)

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)
