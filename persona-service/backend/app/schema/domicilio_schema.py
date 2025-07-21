"""Esquemas de domicilio utilizados por el servicio de personas."""

from marshmallow import fields, pre_load, validate
from marshmallow.validate import Length
from app.schema.domicilio_postal_schema import DomicilioPostalSchema
from app.schema.base_schema import BaseSchema
from app.utils.validar_string import (
    validar_domicilio_calle,
    validar_domicilio_numero,
    validar_domicilio_piso,
    validar_referencias,
    validar_domicilio_dpto                                 
    )

class DomicilioSchema(BaseSchema):

    """Describe el domicilio principal asociado a una persona."""

    id_domicilio=fields.Int(dump_only=True)
    domicilio_calle=fields.Str(required=True, validate=validar_domicilio_calle)
    domicilio_numero=fields.Str(required=True, validate=validar_domicilio_numero)
    domicilio_piso=fields.Str(validate=validar_domicilio_piso)
    domicilio_dpto=fields.Str(validate=validar_domicilio_dpto)
    domicilio_referencia=fields.Str(validate = validar_referencias)
    codigo_postal_id=fields.Int(dump_only=True)

    codigo_postal = fields.Dict(required=True, load_only=True)
    domicilio_postal = fields.Nested(DomicilioPostalSchema, dump_only=True, attribute="codigo_postal")

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)

    @pre_load
    def limpiar_espacios_domicilio(self, data, **kwargs):
        campos_a_limpiar = [
            'domicilio_calle',
            'domicilio_numero',
            'domicilio_piso',
            'domicilio_dpto',
            'domicilio_referencia'
        ]
        for campo in campos_a_limpiar:
            if campo in data and isinstance(data[campo], str):
                data[campo] = data[campo].strip()
        return data
    
    

    
