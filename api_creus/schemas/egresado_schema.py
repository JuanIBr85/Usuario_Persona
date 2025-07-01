from marshmallow import Schema, fields, validate, validates, ValidationError, validates_schema
from datetime import datetime
from models.estado_model import Estado
from models.cohorte_model import Cohorte
from models.egresado_model import Egresado

class EgresadoSchema(Schema):
    id = fields.Int(dump_only = True)
    id_persona = fields.Int(required=True, validate = validate.Range(min=1) )
    fecha_egreso = fields.DateTime(required = True)
    id_cohorte = fields.Int(required=True, validate = validate.Range(min=1) )
    testimonio = fields.Str(
        required=True,
        validate= validate.Length(min=5, max = 3000),
        error_messages={
            "invalid": "El testimonio debe ser una cadena de texto.",
            "too_short": "El testimonio debe tener al menos 5 caracteres.",
            "too_long": "El testimonio no puede superar los 3000 caracteres."
        })
    id_estado = fields.Int(required=True, validate = validate.Range(min=1) )
    observaciones = fields.Str()

#Validacion para que no puedan poner fechas futuras.
@validates("fecha_egreso")
def validate_fecha_egreso(self, value):
    if value > datetime.now():
        raise ValidationError("La fecha de egreso no puede ser en el futuro.")
    

    
@validates_schema
def validar_foraneas_duplicados(self, data, **kwargs):
    errores = {}

    #Validar existencia de la cohorte
    if not Cohorte.query.get(data["id_cohorte"]):
        errores["id_cohorte"] = "La cohorte con ese ID no existe."

    #Validar la existencia de estado
    if not Estado.query.get(data["id_estado"]):
        errores["id_estado"] = "El estado con ese ID no existe."

    if errores:
        raise ValidationError(errores)
    
@validates("testimonio")
def validate_testimonio(self, value):
    if value and len(value.strip()) < 5:
        raise ValidationError("El testimonio debe tener al menos 5 caracteres reales.")