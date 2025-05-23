from marshmallow import Schema, fields

class ContactoSchema(Schema):

    id=fields.Int(dump_only=True)
    telefono_fijo=fields.Str()
    telefono_movil=fields.Str()
    red_social_contacto=fields.Str()

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)