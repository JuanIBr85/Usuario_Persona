from marshmallow import Schema, fields, validates_schema, ValidationError
from utils.validation_utils import not_blank, SacaEspacios, validar_fk_existente
from cms.models.categoria_model import Categoria


class PreguntaFrecuenteSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)
    pregunta = fields.Str(required=True, validate=[not_blank])
    respuesta = fields.Str(required=True, validate=[not_blank])
    id_categoria = fields.Int(required=True)
    posicion = fields.Int(allow_none=True)

    @validates_schema
    def validate_id_categoria(self, data, **kwargs):
        error = validar_fk_existente(
            Categoria, data.get('id_categoria'), 'Categoría')
        if error:
            raise ValidationError({"id_categoria": error})
