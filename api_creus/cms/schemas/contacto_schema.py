from marshmallow import Schema, fields, validate, pre_load, ValidationError
from utils.validation_utils import not_blank, SacaEspacios

class ContactoSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)

    email = fields.Email(validate=[validate.Length(max=100), not_blank], allow_none=True)
    telefono = fields.Str(validate=[validate.Length(max=100), not_blank], allow_none=True)
    direccion = fields.Str(validate=[validate.Length(max=255), not_blank], allow_none=True)
    facebook = fields.Url(allow_none=True)
    instagram = fields.Url(allow_none=True)
    localidad = fields.Str(validate=[validate.Length(max=255), not_blank], allow_none=True)
    provincia = fields.Str(validate=[validate.Length(max=255), not_blank], allow_none=True)
    codigo_postal = fields.Str(validate=[validate.Length(max=20), not_blank], allow_none=True)
    whatsapp = fields.Str(validate=[validate.Length(max=255), not_blank], allow_none=True)