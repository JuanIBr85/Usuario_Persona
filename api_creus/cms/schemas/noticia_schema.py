from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from utils.validation_utils import not_blank, SacaEspacios, validar_duplicado
from cms.models.noticia_model import Noticia
import datetime


class NoticiaSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)
    titulo = fields.Str(required=True, validate=[not_blank])
    contenido = fields.Str(
        required=True,
        validate=[
            not_blank,
            validate.Length(
                min=30, error="El contenido debe tener al menos 30 caracteres.")
        ]
    )
    fecha_publicacion = fields.Date(allow_none=True)
    estado = fields.Str(required=True, validate=validate.OneOf(
        ['archivado', 'borrador', 'publicado']))
    destacada = fields.Bool(required=True)
    imagen_id = fields.Int(allow_none=True)

    @validates_schema
    def validar_datos(self, data, **kwargs):
        estado = data.get("estado")
        fecha = data.get("fecha_publicacion")
        destacada = data.get("destacada")
        id_actual = self.context.get("id") if hasattr(
            self, "context") else None

        # Título duplicado
        if "titulo" in data:
            error = validar_duplicado(
                Noticia, Noticia.titulo, data["titulo"], id_actual)
            if error:
                raise ValidationError({"titulo": error})

        # Si está publicado, debe tener fecha
        if estado == "publicado":
            if not fecha:
                # Si no hay fecha, usar la fecha actual
                data["fecha_publicacion"] = datetime.date.today()

        # Si es destacada, debe estar publicada
        if destacada and estado != "publicado":
            raise ValidationError(
                {"destacada": "Solo pueden estar destacadas las noticias publicadas."})
