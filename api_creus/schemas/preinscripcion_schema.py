from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from models.cohorte_model import Cohorte
from models.estado_model import Estado
from models.preinscripcion_model import Preinscripcion
class PreinscripcionSchema(Schema):
    id = fields.Int(dump_only=True)

    id_usuario = fields.Int(required=True)
    id_cohorte = fields.Int(required=True)
    fecha_hora_preinscripcion = fields.DateTime(required=True)
    id_estado = fields.Int(required=False, load_default = 3)
    observaciones = fields.Str(allow_none=True, validate=validate.Length(max=500))

    @validates_schema
    def validar_foraneas(self, data, **kwargs):

        errores = {}
        # Validar cohorte
        if not Cohorte.query.get(data["id_cohorte"]):
            errores ["id_cohorte"] = "La cohorte con ese id no existe"
        
        # Validar estado
        if not Estado.query.get(data["id_estado"]):
            errores ["id_estado"] = "El estado especificado no existe"
        
        if errores:
            raise ValidationError(errores)