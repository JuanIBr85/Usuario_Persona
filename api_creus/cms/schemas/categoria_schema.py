from marshmallow import Schema, fields, validates_schema, ValidationError
from utils.validation_utils import not_blank, SacaEspacios, validar_duplicado
from marshmallow import Schema, fields, validates_schema, ValidationError
from utils.validation_utils import not_blank, SacaEspacios, validar_duplicado
from cms.models.categoria_model import Categoria


class CategoriaSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(required=True, validate=[not_blank])
    observacion = fields.Str(allow_none=True)

    @validates_schema
    def validar_nombre_duplicado(self, data, **kwargs):
        if "nombre" in data:
            id_actual = self.context.get("id") if hasattr(
                self, "context") else None
            error = validar_duplicado(
                Categoria, Categoria.nombre, data["nombre"], id_actual)
            if error:
                raise ValidationError({"nombre": error})
