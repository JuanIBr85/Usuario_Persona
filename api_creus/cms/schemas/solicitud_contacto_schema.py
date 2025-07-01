from marshmallow import Schema, fields, validate, ValidationError
from utils.validation_utils import not_blank, SacaEspacios

def validar_telefono(value):
    if value and not value.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").isdigit():
        raise ValidationError("El teléfono debe contener solo números, espacios, guiones, paréntesis y el símbolo +.")

class SolicitudContactoSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(required=True, validate=[validate.Length(min=2, max=100), not_blank])
    apellido = fields.Str(required=True, validate=[validate.Length(min=2, max=100), not_blank])
    email = fields.Email(required=True, validate=[validate.Length(max=255), not_blank])
    telefono = fields.Str(validate=[validate.Length(max=20), validar_telefono], allow_none=True)
    localidad = fields.Str(validate=[validate.Length(max=100)], allow_none=True)
    mensaje = fields.Str(required=True, validate=[validate.Length(min=10, max=500), not_blank])
    respondida = fields.Bool(load_default=False)
    fecha_creacion = fields.DateTime(dump_only=True)
    fecha_respuesta = fields.DateTime(allow_none=True)