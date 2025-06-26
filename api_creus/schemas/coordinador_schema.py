from marshmallow import Schema, fields, validate

class CoordinadorSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío o tener solo espacios")
        ]
    )
    apellido = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío o tener solo espacios")
        ]
    )
    email = fields.Email(required=True)
    telefono = fields.Int(allow_none=True)
    id_estado = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)
