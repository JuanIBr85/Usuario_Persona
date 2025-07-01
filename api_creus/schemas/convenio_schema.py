from marshmallow import Schema, fields, validate

class ConvenioSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    descripcion = fields.Str(allow_none=True)
    fecha_inicio = fields.DateTime(
        required=True,
        format='%Y-%m-%d'
    )
    fecha_fin = fields.DateTime(
        required=True,
        format='%Y-%m-%d'
    )
    id_archivo = fields.Int(allow_none=True)
    id_institucion = fields.Int(required=True)
    id_estado = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)



