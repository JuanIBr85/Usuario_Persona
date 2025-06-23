from marshmallow import Schema, fields, validate

class InstitucionSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    email = fields.Email(required=True)
    telefono = fields.Int(allow_none=True)
    pagina_web = fields.Str(allow_none=True)
    calle = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255),
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



'''from marshmallow import Schema, fields, validate

class InstitucionSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    email = fields.Email(allow_none=True, validate=validate.Length(max=255))
    telefono = fields.Str(validate=validate.Length(min=8, max=20), allow_none=True)
    pagina_web = fields.Str(allow_none=True, validate=validate.Length(max=255))
    calle = fields.Str(allow_none=True, validate=validate.Length(max=255))
    numero = fields.Int(allow_none=True)
    ciudad = fields.Str(allow_none=True, validate=validate.Length(max=100))
    provincia = fields.Str(allow_none=True, validate=validate.Length(max=100))
    pais = fields.Str(allow_none=True, validate=validate.Length(max=100))
    codigo_postal = fields.Str(allow_none=True, validate=validate.Length(max=20))
    id_estado = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)

  #  tipo_institucion = fields.Str(
  #      validate=validate.OneOf(['UNIVERSIDAD', 'INSTITUTO', 'ESCUELA', 'OTRO']),
  #      required=True
  #  )'''