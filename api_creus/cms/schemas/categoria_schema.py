from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from utils.validation_utils import not_blank, SacaEspacios, validar_duplicado, validar_fk_existente
from cms.models.categoria_model import Categoria
from cms.models.preguntas_frecuentes_model import PreguntaFrecuente


class CategoriaSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)

    nombre = fields.Str(
        required=True,
        validate=[not_blank, validate.Length(max=255)],
        error_messages={
            "required": "El campo nombre es obligatorio.",
            "null": "El campo nombre no puede ser nulo.",
            "invalid": "Debe ser una cadena de texto válida."
        }
    )

    observacion = fields.Str(allow_none=True, load_default=None)

    @validates_schema
    def validar_nombre_unico(self, data, **kwargs):
        id_actual = self.context.get("id")  # Contexto para update
        if not id_actual:
            id_actual = data.get("id")

        error = validar_duplicado(
            Categoria, Categoria.nombre, data.get("nombre"), id_actual
        )
        if error:
            raise ValidationError(error, field_name="nombre")