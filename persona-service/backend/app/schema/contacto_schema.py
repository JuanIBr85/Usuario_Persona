from marshmallow import Schema, fields

class ContactoSchema(Schema):

    id_contacto=fields.Int(dump_only=True)
    telefono_fijo=fields.Str()
    telefono_movil=fields.Str(required=True)
    red_social_contacto=fields.Str()

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)