from marshmallow import Schema, ValidationError, fields, pre_load
from config import ESTADO_CIVIL,ESTUDIOS_ALCANZADOS,OCUPACION
from app.utils.vacios import permitir_vacios

class PersonaExtendidaSchema(Schema):

    id_extendida=fields.Int(dump_only=True)
    estado_civil = fields.Str(allow_none=True, required=False,validate=permitir_vacios(ESTADO_CIVIL))
    ocupacion = fields.Str(allow_none=True, required=False,validate=permitir_vacios(OCUPACION))
    estudios_alcanzados = fields.Str(allow_none=True, required=False,validate=permitir_vacios(ESTUDIOS_ALCANZADOS))
    vencimiento_dni = fields.Date(required=False, allow_none=True)
    foto_perfil = fields.Str(required=False, allow_none=True)

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)
    

    @pre_load
    def limpiar_vencimiento_dni(self, data, **kwargs):
        if "vencimiento_dni" in data and data["vencimiento_dni"] == "":
            data["vencimiento_dni"] = None
        return data