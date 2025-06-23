from marshmallow import Schema, fields, validate

class PropuestaEducativaSchema(Schema):
    id = fields.Int(dump_only=True)

    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío o solo con espacios")
        ]
    )

    descripcion = fields.Str()
    duracion = fields.Str(validate=validate.Length(max=255))
    titulo_otorgado = fields.Str(validate=validate.Length(max=255))
    requisitos_ingreso = fields.Str()
    perfil_egresado = fields.Str()
    salida_laboral = fields.Str()
    observaciones = fields.Str()

    # Relaciones por ID
    id_modalidad = fields.Int(allow_none=True)
    id_convenio = fields.Int(allow_none=True)
    id_tipo_propuesta = fields.Int(allow_none=True)
    id_estado = fields.Int(allow_none=True)
    id_area_conocimiento = fields.Int(allow_none=True)
    id_titulo_certificacion = fields.Int(allow_none=True)