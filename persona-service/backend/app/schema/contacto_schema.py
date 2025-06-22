from marshmallow import Schema, fields, validate
from marshmallow.validate import Length
from config import REDES_SOCIALES_VALIDAS
from app.utils.vacios import permitir_vacios


class ContactoSchema(Schema):

    id_contacto=fields.Int(dump_only=True)
    telefono_fijo=fields.Str()
    telefono_movil=fields.Str(required=True)
    red_social_contacto=fields.Str()
    red_social_nombre=fields.Str(allow_none=True, required=False, validate=permitir_vacios(REDES_SOCIALES_VALIDAS))
    email_contacto=fields.Str()
    observacion_contacto=fields.Str(validate=Length(max=1000))

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)