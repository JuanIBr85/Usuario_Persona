from marshmallow import Schema, post_dump, pre_load

CAPITALIZE_FIELDS = {
    "nombre_persona",
    "apellido_persona",
    "domicilio_calle",
    "domicilio_referencia",
    "observacion_contacto",
}

LOWER_FIELDS = {
    "red_social_contacto", 
    "email_contacto",
    }


def _normalizacion_string(data):
    for key, value in data.items():
        if not isinstance(value, str):
            continue

        key_lower = key.lower()

        if key_lower in LOWER_FIELDS:
            data[key] = value.lower()
        elif key_lower in CAPITALIZE_FIELDS:
            data[key] = value.capitalize()

    return data        

class BaseSchema(Schema):
    @pre_load
    def entrada_normalizada(self, data, **kwargs):
        return _normalizacion_string(data)

    @post_dump
    def formato_string(self, data, **kwargs):
        return _normalizacion_string(data)