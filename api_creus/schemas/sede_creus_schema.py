from marshmallow import Schema, fields, validate

class SedeCreusSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    email = fields.Email(allow_none=True)
    telefono = fields.Int(allow_none=True)
    pagina_web = fields.Str(allow_none=True)
    calle = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    numero = fields.Int(required=True, validate=validate.Range(min=1))
    ciudad = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    provincia = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    pais = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    codigo_postal = fields.Str(allow_none=True)
    id_estado = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)
