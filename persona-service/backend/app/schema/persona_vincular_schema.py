from marshmallow import Schema, fields, validate
#from app.schema.base_schema import BaseSchema


class ValidarDocumentoSchema(Schema):
    tipo_documento = fields.Str(required=True)
    num_doc_persona = fields.Str(required=True)


class ValidarDocumentoEmailSchema(Schema):
    tipo_documento = fields.Str(required=True)
    num_doc_persona = fields.Str(required=True)
    email_confirmado = fields.Email(required=True)


class ValidarOtpSchema(Schema):
    otp_token = fields.Str(required=True)
    codigo = fields.Str(required=True, validate=validate.Length(min=6, max=6))
