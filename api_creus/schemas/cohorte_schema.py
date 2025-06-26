from marshmallow import Schema, fields, validate

class CohorteSchema(Schema):
    id = fields.Int(dump_only=True)
    id_propuesta_educativa = fields.Int(required=True)
    numero_cohorte = fields.Int(required=True, validate=validate.Range(min=1))
    anio_inicio = fields.Int(required=True)
    mes_inicio = fields.Str(
        required=True,
        validate=[
            validate.Length(min=3, max=20, error="El mes debe tener entre 3 y 20 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    fecha_inicio_preinscripcion = fields.DateTime(required=True)
    fecha_cierre_preinscripcion = fields.DateTime(required=True)
    fecha_inicio_cursado = fields.DateTime(required=True)
    fecha_estimada_finalizacion = fields.DateTime(required=True)
    cupos_maximos = fields.Int(required=True, validate=validate.Range(min=1, error="El cupo máximo tiene que ser mayor o igual a 1"))
    cupos_ocupados = fields.Int(required=True, validate=validate.Range(min=0, error="El cupo mínimo tiene que ser mayor o igual a 0"))
    id_estado = fields.Int(required=True)
    id_coordinador = fields.Int(required=True)
    id_sede_creus = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)
