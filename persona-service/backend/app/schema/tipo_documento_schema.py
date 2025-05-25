from marshmallow import Schema, fields

class TipoDocumentoSchema(Schema):

    id_tipo_documento=fields.Int(dump_only=True)
    tipo_documento=fields.Str(required=True)

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
