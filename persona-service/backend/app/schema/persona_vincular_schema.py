"""Esquemas utilizados para vincular o verificar identidades."""

from marshmallow import Schema, fields, validate
from config import TIPOS_DOCUMENTO_VALIDOS
from app.schema.persona_schema import FormatoDocumentoSchema

class ValidarDocumentoSchema(FormatoDocumentoSchema):

    """Valida la existencia de un documento."""

    tipo_documento = fields.Str(required=True)
    num_doc_persona = fields.Str(required=True)


class ValidarDocumentoEmailSchema(FormatoDocumentoSchema):

    """Valida documento y un correo electrónico asociado."""

    tipo_documento = fields.Str(required=True)
    num_doc_persona = fields.Str(required=True)
    email_confirmado = fields.Email(required=True)


class ValidarOtpSchema(Schema):

    """Comprueba el código OTP enviado al usuario."""

    otp_token = fields.Str(required=True)
    codigo = fields.Str(required=True, validate=validate.Length(min=6, max=6))

class VerificarIdentidadSchema(FormatoDocumentoSchema):

    """Datos requeridos para verificar la identidad de una persona."""

    nombre_persona = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    apellido_persona = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    fecha_nacimiento_persona = fields.Date(required=True, format="%Y-%m-%d")
    telefono_movil = fields.Str(required=True, validate=validate.Length(min=8, max=20))
    tipo_documento = fields.Str(
        required=True, validate=validate.OneOf(list(TIPOS_DOCUMENTO_VALIDOS.keys()))
    )    
    num_doc_persona = fields.Str(required=True, validate=validate.Length(min=8, max=30))
    usuario_email = fields.Email(required=True, validate=validate.Length(max=50))

