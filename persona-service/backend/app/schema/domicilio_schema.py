from marshmallow import Schema, fields
from app.schema.domicilio_postal_schema import DomicilioPostalSchema

class DomicilioSchema(Schema):

    id_domicilio=fields.Int(dump_only=True)
    domicilio_calle=fields.Str(required=True)
    domicilio_numero=fields.Str(required=True)
    domicilio_piso=fields.Str()
    domicilio_dpto=fields.Str()

    codigo_postal_id=fields.Int(required=True)

    #completar al crear el schema domicilio postal para mantener la relacion
    codigo_postal=fields.Nested(DomicilioPostalSchema, dump_only=True)

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)

