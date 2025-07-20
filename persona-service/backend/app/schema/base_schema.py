from marshmallow import Schema, post_dump, pre_load

CAPITALIZE_FIELDS = {
    "domicilio_referencia",
    "observacion_contacto",
    }

LOWER_FIELDS = {
    "red_social_contacto", 
    "email_contacto",
    }

TITLE_FIELDS ={
    "nombre_persona",
    "apellido_persona",
    "domicilio_calle",    
}

def titulo_con_excepciones(texto):

    """Capitaliza cada palabra excepto preposiciones y artículos comunes, excepto si es la primera."""

    excepciones = {"de", "del", "la", "las", "los", "el", "y", "en", "con", "por", "a", "o"}
    palabras = texto.lower().split()
    resultado = []

    for i, palabra in enumerate(palabras):
        if i == 0 or palabra not in excepciones:
            resultado.append(palabra.capitalize())
        else:
            resultado.append(palabra)

    return " ".join(resultado)


def _normalizacion_string(data):
    for key, value in data.items():
        if not isinstance(value, str):
            continue

        key_lower = key.lower()

        if key_lower in LOWER_FIELDS:
            data[key] = value.lower()
        elif key_lower in CAPITALIZE_FIELDS:
            data[key] = value.capitalize()
        elif key_lower in TITLE_FIELDS:
            data[key] = titulo_con_excepciones(value)       

    return data        

class BaseSchema(Schema):
    @pre_load
    def entrada_normalizada(self, data, **kwargs):
        return _normalizacion_string(data)

    @post_dump
    def formato_string(self, data, **kwargs):
        return _normalizacion_string(data)