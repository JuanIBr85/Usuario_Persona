from marshmallow import Schema, fields, validate

class ArchivoSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    url_archivo = fields.Str(
        required=True,
        validate=[
            validate.Length(min=3, error="La URL debe tener al menos 3 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    id_propuesta_educativa = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)


