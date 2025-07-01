from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from utils.validation_utils import not_blank, SacaEspacios, validar_duplicado
from cms.models.seccion_model import Seccion


class SeccionSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(required=True, validate=[not_blank])
    descripcion = fields.Str(allow_none=True)
    visible = fields.Boolean(required=True)

    @validates_schema
    def validar_nombre_duplicado(self, data, **kwargs):
        if "nombre" in data:
            id_actual = self.context.get("id") if hasattr(
                self, "context") else None
            error = validar_duplicado(
                Seccion, Seccion.nombre, data["nombre"], id_actual)
            if error:
                raise ValidationError({"nombre": error})
