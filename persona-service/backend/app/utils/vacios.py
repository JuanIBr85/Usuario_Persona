from marshmallow import ValidationError

def permitir_vacios(valores):
    def validacion(value):
        if value in (None, ""):
            return
        if value not in valores:
            raise ValidationError(f"Debe ser uno de: {', '.join(valores)}")
    return validacion