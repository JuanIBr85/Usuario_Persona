from marshmallow import Schema, fields, validate
from config import TIPOS_DOCUMENTO_VALIDOS


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

class VerificarIdentidadSchema(Schema):
    nombre_persona = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    apellido_persona = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    fecha_nacimiento_persona = fields.Date(required=True, format="%Y-%m-%d")
    telefono_movil = fields.Str(required=True, validate=validate.Length(min=8, max=20))
    tipo_documento = fields.Str(
        required=True, validate=validate.OneOf(list(TIPOS_DOCUMENTO_VALIDOS.keys()))
    )    
    num_doc_persona = fields.Str(required=True, validate=validate.Length(min=8, max=30))
    usuario_email = fields.Email(required=True, validate=validate.Length(max=50))

