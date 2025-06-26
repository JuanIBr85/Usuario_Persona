from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from utils.validation_utils import not_blank, SacaEspacios, validar_fk_existente
from cms.models.categoria_model import Categoria
from cms.models.preguntas_frecuentes_model import PreguntaFrecuente

class PreguntaFrecuenteSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)

    pregunta = fields.Str(
        required=True,
        validate=[not_blank],
        error_messages={
            "required": "El campo pregunta es obligatorio.",
            "null": "El campo pregunta no puede ser nulo.",
            "invalid": "Debe ser una cadena de texto válida."
        }
    )

    respuesta = fields.Str(
        required=True,
        validate=[not_blank],
        error_messages={
            "required": "El campo respuesta es obligatorio.",
            "null": "El campo respuesta no puede ser nulo.",
            "invalid": "Debe ser una cadena de texto válida."
        }
    )

    posicion = fields.Int(
        required=True,
        error_messages={
            "required": "El campo posicion es obligatorio.",
            "null": "El campo posicion no puede ser nulo.",
            "invalid": "La posición debe ser un número entero válido."
        }
    )

    id_categoria = fields.Int(
        required=True,
        error_messages={
            "required": "El campo id_categoria es obligatorio.",
            "null": "El campo id_categoria no puede ser nulo.",
            "invalid": "Debe ser un número entero válido."
        }
    )

    @validates_schema
    def validar_campos(self, data, **kwargs):
        errores = {}

        # Validar existencia de categoría
        error = validar_fk_existente(
            Categoria, data.get("id_categoria"), "Categoría"
        )
        if error:
            errores["id_categoria"] = [error]

        # Validar que la posición sea positiva
        if "posicion" in data and data["posicion"] <= 0:
            errores["posicion"] = ["La posición debe ser un número positivo"]

        # Validar posición duplicada en misma categoría
        if "posicion" in data and "id_categoria" in data:
            posicion = data["posicion"]
            id_categoria = data["id_categoria"]

            # Acceder al contexto de forma segura para update
            id_instancia = getattr(self, 'context', {}).get("id_instancia")

            query = PreguntaFrecuente.query.filter_by(
                posicion=posicion,
                id_categoria=id_categoria
            )
            if id_instancia:
                query = query.filter(PreguntaFrecuente.id != id_instancia)

            if query.first():
                errores["posicion"] = [
                    f"Ya existe una pregunta con posición {posicion} en esta categoría"
                ]

        if errores:
            raise ValidationError(errores)
