from datetime import date, timedelta
from marshmallow import ValidationError

def validar_vencimiento_dni(valor):

    """Valida que la fecha de vencimiento del DNI sea posterior al 01-04-2032 y no excesivamente futura."""

    if valor is None:
        return None

    fecha_minima = date(2032, 4, 1)
    fecha_maxima = date.today() + timedelta(days=365*20)
    if valor < fecha_minima:
        raise ValidationError("La fecha de vencimiento del DNI no puede ser anterior al 1 de abril de 2032.")

    if valor > fecha_maxima:
        raise ValidationError("La fecha de vencimiento del DNI excede el límite razonable (20 años).")

    return valor


def validar_fecha_nacimiento(valor):

    """Valida que la persona tenga al menos 17 años a la fecha actual."""

    if valor is None:
        raise ValidationError("La fecha de nacimiento es requerida")

    hoy = date.today()
    fecha_minima = hoy.replace(year=hoy.year - 100)
    fecha_maxima = hoy.replace(year=hoy.year - 17)

    if valor < fecha_minima:
        raise ValidationError(f"La fecha de nacimiento no puede ser anterior a {fecha_minima.isoformat()})")

    if valor > fecha_maxima:
        raise ValidationError("La persona debe tener al menos 17 años")

    return valor