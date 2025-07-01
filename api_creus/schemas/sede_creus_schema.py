from marshmallow import Schema, fields, validate

class SedeCreusSchema(Schema):
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
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

    pagina_web = fields.Str(
        allow_none=True,
        validate=[
            validate.Length(max=255, error="La URL no puede superar los 255 caracteres"),
            validate.Regexp(r'^(https?://)?([\da-z.-]+).([a-z.]{2,6})([/\w.-])/?$',error="El formato de la URL es inválido")
        ]
    )

    calle = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre de la calle debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )

    numero = fields.Str(
        required=True,
        validate=[
        validate.Length(max=20, error="El numero de la calle no puede superar los 20 caracteres"),
        validate.Regexp(r'^[\w\s/-]+$', error="Número de calle inválido")
        ]
    )

    ciudad = fields.Str(
        required=True,
        validate=[
        validate.Length(min=1, max=255, error="El nombre de la ciudad debe tener entre 1 y 255 caracteres"),
        validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )

    provincia = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre de la provincia debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )

    pais = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre del país debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )

    codigo_postal = fields.Str(
        allow_none=True,
        validate=[
            validate.Length(max=20, error="El código postal no puede superar los 20 caracteres"),
            validate.Regexp(r'^[A-Za-z0-9\- ]*$', error="Código postal inválido")
        ]
    )   

    id_estado = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)