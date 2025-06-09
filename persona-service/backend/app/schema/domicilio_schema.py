from marshmallow import Schema, fields
from marshmallow.validate import Length
from app.schema.domicilio_postal_schema import DomicilioPostalSchema

class DomicilioSchema(Schema):

    id_domicilio=fields.Int(dump_only=True)
    domicilio_calle=fields.Str(required=True)
    domicilio_numero=fields.Str(required=True)
    domicilio_piso=fields.Str()
    domicilio_dpto=fields.Str()
    domicilio_referencia=fields.Str(validate=Length(max=1000))
    codigo_postal_id=fields.Int(dump_only=True)

    codigo_postal = fields.Dict(required=True, load_only=True)
    domicilio_postal = fields.Nested(DomicilioPostalSchema, dump_only=True, attribute="codigo_postal")

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)

