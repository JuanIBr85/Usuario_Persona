from marshmallow import Schema, fields, validate
from utils.validation_utils import not_blank, SacaEspacios

class PaginaInicioSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)
    titulo = fields.Str(required=True,validate=[validate.Length(max=255), not_blank])
    subtitulo = fields.Str(required=False,allow_none=True,validate=[not_blank])
    slogan = fields.Str(required=False,allow_none=True,validate=[not_blank])