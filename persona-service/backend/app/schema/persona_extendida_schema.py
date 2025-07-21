"""Esquema con información opcional de la persona."""

from marshmallow import ValidationError, fields, pre_load
from config import ESTADO_CIVIL,ESTUDIOS_ALCANZADOS,OCUPACION
from app.utils.vacios import permitir_vacios
from app.utils.validar_fechas import validar_vencimiento_dni
from app.utils.validar_string import validar_foto_perfil
from app.schema.base_schema import BaseSchema

class PersonaExtendidaSchema(BaseSchema):

    """Datos adicionales que puede registrar la persona."""

    id_extendida=fields.Int(dump_only=True)
    estado_civil = fields.Str(allow_none=True, required=False,validate=permitir_vacios(ESTADO_CIVIL))
    ocupacion = fields.Str(allow_none=True, required=False,validate=permitir_vacios(OCUPACION))
    estudios_alcanzados = fields.Str(allow_none=True, required=False,validate=permitir_vacios(ESTUDIOS_ALCANZADOS))
    vencimiento_dni = fields.Date(required=False, allow_none=True, validate= validar_vencimiento_dni)
    foto_perfil = fields.Str(required=False, allow_none=True, validate= validar_foto_perfil)

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)
    

    @pre_load
    def limpiar_persona_extendida(self, data, **kwargs):
        if "vencimiento_dni" in data and data["vencimiento_dni"] == "":
            data["vencimiento_dni"] = None

        if "foto_perfil" in data and isinstance(data["foto_perfil"], str):
            data["foto_perfil"] = data["foto_perfil"].strip()

        return data