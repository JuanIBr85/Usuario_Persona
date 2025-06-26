from marshmallow import Schema, fields, validate

class PropuestaEducativaSchema(Schema):
    id = fields.Int(dump_only=True)

    nombre = fields.Str(
    required=True,
    validate=[
        validate.Length(min=1, max=255, error="El nombre debe tener entre 1 y 255 caracteres"),
        validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío o solo con espacios")
    ]
    )
    descripcion = fields.Str(allow_none=True)
    duracion = fields.Str(required=True, validate=validate.Length(min=2, max=255, error="La duración debe tener entre 2 y 255 caracteres"))
    titulo_otorgado = fields.Str(required=True, validate=validate.Length(min=2, max=255, error="El título otorgado debe tener entre 2 y 255 caracteres"))
    requisitos_ingreso = fields.Str(required=True)
    perfil_egresado = fields.Str(required=True)
    salida_laboral = fields.Str(required=True)
    observaciones = fields.Str(allow_none=True)

    # Relaciones (FK)
    id_modalidad = fields.Int(required=True)
    id_convenio = fields.Int(allow_none=True)
    id_tipo_propuesta = fields.Int(required=True)
    id_estado = fields.Int(required=True)
    id_area_conocimiento = fields.Int(required=True)
    id_titulo_certificacion = fields.Int(required=True)