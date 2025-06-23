from marshmallow import Schema, fields, validate

class AreaConocimientoSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    observaciones = fields.Str(allow_none=True)