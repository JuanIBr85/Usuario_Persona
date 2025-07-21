"""Validaciones que permiten valores vacíos en determinados campos."""

from marshmallow import ValidationError

def permitir_vacios(valores):

    """Crea un validador que admite cadenas vacías para ciertos campos."""

    def validacion(value):
        if value in (None, ""):
            return
        if value not in valores:
            raise ValidationError(f"Debe ser uno de: {', '.join(valores)}")
    return validacion