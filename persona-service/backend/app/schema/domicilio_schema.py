from marshmallow import fields, pre_load
from marshmallow.validate import Length
from app.schema.domicilio_postal_schema import DomicilioPostalSchema
from app.schema.base_schema import BaseSchema
from app.utils.validar_string import validar_nombre_calle

class DomicilioSchema(BaseSchema):

    id_domicilio=fields.Int(dump_only=True)
    domicilio_calle=fields.Str(required=True)
    domicilio_numero=fields.Str(required=True)
    domicilio_piso=fields.Str()
    domicilio_dpto=fields.Str()
    domicilio_referencia=fields.Str(validate=Length(max=150))
    codigo_postal_id=fields.Int(dump_only=True)

    codigo_postal = fields.Dict(required=True, load_only=True)
    domicilio_postal = fields.Nested(DomicilioPostalSchema, dump_only=True, attribute="codigo_postal")

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)


    @pre_load
    def limpiar_espacios_domicilio(self, data, **kwargs):
        if 'domicilio_calle' in data and isinstance(data['domicilio_calle'], str):
            data['domicilio_calle'] = data['domicilio_calle'].strip()
        return data

