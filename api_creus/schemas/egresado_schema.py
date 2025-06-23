from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import datetime

class EgresadoSchema(Schema):
    id = fields.Int(dump_only = True)
    id_persona = fields.Int(required=True, validate = validate.Range(min=1) )
    fecha_egreso = fields.DateTime(required = True)
    id_cohorte = fields.Int(required=True, validate = validate.Range(min=1) )
    testimonio = fields.Str(required=True)
    id_estado = fields.Int(required=True, validate = validate.Range(min=1) )
    observaciones = fields.Str()

#Validacion para que no puedan poner fechas futuras.
@validates("fecha_egreso")
def validate_fecha_egreso(self, value):
    if value > datetime.now():
        raise ValidationError("La fecha de egreso no puede ser en el futuro.")