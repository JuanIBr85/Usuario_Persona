from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from utils.validation_utils import not_blank, SacaEspacios, validar_fk_existente
from cms.models.seccion_model import Seccion
from cms.models.bloque_seccion_model import BloqueSeccion


class BloqueSeccionSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)
    id_seccion = fields.Int(required=True)
    tipo = fields.Str(
        required=True, validate=validate.OneOf(["icono", "texto"]))
    titulo = fields.Str(required=True, validate=[not_blank])
    contenido = fields.Str(allow_none=True)
    orden = fields.Int(allow_none=True)
    visible = fields.Boolean(required=True)

    @validates_schema
    def validar_fk_y_duplicados(self, data, **kwargs):
        id_actual = self.context.get("id") if hasattr(
            self, "context") else None

        # Validar FK a sección
        if "id_seccion" in data:
            error_fk = validar_fk_existente(
                Seccion, data["id_seccion"], "Sección")
            if error_fk:
                raise ValidationError({"id_seccion": error_fk})

        # Validar título duplicado dentro de la misma sección
        if "titulo" in data and "id_seccion" in data:
            query = BloqueSeccion.query.filter_by(
                id_seccion=data["id_seccion"],
                titulo=data["titulo"]
            )
            if id_actual:
                query = query.filter(BloqueSeccion.id != id_actual)
            if query.first():
                raise ValidationError(
                    {"titulo": "Ya existe un bloque con ese título en esta sección"})

        # Validar orden duplicado dentro de la misma sección
        if data.get("orden") is not None and "id_seccion" in data:
            if data["orden"] not in [1, 2, 3]:
                raise ValidationError({"orden": "El orden debe ser 1, 2 o 3"})

            query = BloqueSeccion.query.filter_by(
                id_seccion=data["id_seccion"],
                orden=data["orden"]
            )
            if id_actual:
                query = query.filter(BloqueSeccion.id != id_actual)
            if query.first():
                raise ValidationError(
                    {"orden": "Ya hay un bloque con ese orden en esta sección"})
