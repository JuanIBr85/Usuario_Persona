from marshmallow import fields, validate, post_load, pre_load
from config import TIPOS_DOCUMENTO_VALIDOS
from app.schema.contacto_schema import ContactoSchema
from app.schema.domicilio_schema import DomicilioSchema
from app.schema.persona_extendida_schema import PersonaExtendidaSchema
from app.schema.base_schema import BaseSchema
from app.utils.validar_string import validar_nombre_apellido
from app.utils.validar_fechas import validar_fecha_nacimiento
from app.schema.persona_vincular_schema import ValidarDocumentoSchema



class PersonaSchema(ValidarDocumentoSchema):
    id_persona = fields.Int(dump_only=True)
    nombre_persona = fields.Str(required=True,validate=validar_nombre_apellido)
    apellido_persona = fields.Str(required=True,validate=validar_nombre_apellido)
    fecha_nacimiento_persona = fields.Date(required=True,validate = validar_fecha_nacimiento)

    usuario_id = fields.Int(required=False, allow_none=True)

    persona_extendida = fields.Nested(PersonaExtendidaSchema, required=False)
    domicilio = fields.Nested(DomicilioSchema, required=True)
    contacto = fields.Nested(ContactoSchema, required=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    deleted_at = fields.DateTime(dump_only=True)

    @pre_load
    def limpiar_espacios_persona(self, data, **kwargs):
        if 'nombre_persona' in data and isinstance(data['nombre_persona'], str):
            data['nombre_persona'] = data['nombre_persona'].strip()
        if 'apellido_persona' in data and isinstance(data['apellido_persona'], str):
            data['apellido_persona'] = data['apellido_persona'].strip()
        return data
    

class PersonaResumidaSchema(ValidarDocumentoSchema):
    id_persona = fields.Int(dump_only=True)
    nombre_persona = fields.Str(required=True,validate=validar_nombre_apellido)
    apellido_persona = fields.Str(required=True,validate=validar_nombre_apellido)
    fecha_nacimiento_persona = fields.Date(required=True,validate = validar_fecha_nacimiento)
    usuario_id = fields.Int(required=False)
