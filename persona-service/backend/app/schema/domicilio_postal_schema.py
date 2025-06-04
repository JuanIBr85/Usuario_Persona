from marshmallow import Schema, fields

class DomicilioPostalSchema(Schema):

    id_domicilio_postal=fields.Int(dump_only=True)
    codigo_postal = fields.Str(required=True)
    localidad = fields.Str(required=True)
    partido = fields.Str(required=True)
    provincia = fields.Str(required=True)

    