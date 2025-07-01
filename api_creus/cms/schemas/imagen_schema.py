from marshmallow import Schema, fields, validate
from utils.validation_utils import not_blank, SacaEspacios

class ImagenSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(required=True, validate=[validate.Length(max=255), not_blank])
    url = fields.Str(required=True, validate=[not_blank])
    tipo = fields.Str(
        required=True,
        validate=[validate.OneOf(['noticia', 'logo', 'icono', 'carrusel', 'propuesta_educativa']), not_blank]
    )
    descripcion = fields.Str(required=False, allow_none=True)
    id_noticia = fields.Int(allow_none=True)
    visible = fields.Bool(required=True)