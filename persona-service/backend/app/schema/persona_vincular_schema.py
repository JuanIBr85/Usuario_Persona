from marshmallow import Schema, fields, validate, validates_schema, ValidationError, post_load
from config import TIPOS_DOCUMENTO_VALIDOS
from app.utils.documentos_utils import validar_documento_por_tipo
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

class ValidarDocumentoSchema(FormatoDocumentoSchema):
    tipo_documento = fields.Str(
        required=True, validate=validate.OneOf(list(TIPOS_DOCUMENTO_VALIDOS.keys()))
    )
    num_doc_persona = fields.Str(required=True)
    
    @validates_schema
    def validate_num_doc_based_on_tipo(self, data, **kwargs):
        tipo_doc = data.get('tipo_documento')
        num_doc = data.get('num_doc_persona')

        result = validar_documento_por_tipo(tipo_doc, num_doc)
        if result == False:
            raise ValidationError({
                "num_doc_persona": "Documento no valido"
            })
        
        if result == -4:
            raise ValidationError({
                "num_doc_persona": "CUIL/CUIT no valido"
            })

class ValidarDocumentoEmailSchema(ValidarDocumentoSchema):
    email_confirmado = fields.Email(required=True)


class ValidarOtpSchema(Schema):
    otp_token = fields.Str(required=True)
    codigo = fields.Str(required=True, validate=validate.Length(min=6, max=6))

class VerificarIdentidadSchema(ValidarDocumentoSchema):
    nombre_persona = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    apellido_persona = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    fecha_nacimiento_persona = fields.Date(required=True, format="%Y-%m-%d")
    telefono_movil = fields.Str(required=True, validate=validate.Length(min=8, max=20))
    usuario_email = fields.Email(required=True, validate=validate.Length(max=50))

