from marshmallow import Schema, fields, validate

class CoordinadorSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío o tener solo espacios")
        ]
    )
    apellido = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El apellido debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío o tener solo espacios")
        ]
    )

    email = fields.Email(allow_none=True, error_messages={"invalid": "El formato del email es inválido"}, 
        validate=[validate.Length(max=50, error="El email no puede superar los 50 caracteres")]
    )

    telefono = fields.Str(
        allow_none=True,
        validate=[
            validate.Length(max=20, error="El número de teléfonode no puede superar los 20 caracteres"),
            validate.Regexp(r'^\+?\d{0,20}$', error="El teléfono debe contener solo dígitos y opcionalmente un '+'")
        ]
    )
    id_estado = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)
