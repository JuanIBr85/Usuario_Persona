from marshmallow import fields
from app.schema.base_schema import BaseSchema

class DomicilioPostalSchema(BaseSchema):

    id_domicilio_postal=fields.Int(dump_only=True)
    codigo_postal = fields.Str(required=True)
    localidad = fields.Str(required=True)
    partido = fields.Str(required=True)
    provincia = fields.Str(required=True)

    