from datetime import date, timedelta
from marshmallow import ValidationError

def validar_vencimiento_dni(valor):

    """Valida que la fecha de vencimiento del DNI."""

    if valor is None:
        return None

    fecha_minima = date.today()
    fecha_maxima = date.today() + timedelta(days=365*20)
    if valor < fecha_minima:
        raise ValidationError("La fecha de vencimiento del DNI no puede ser anterior a la fecha actual")

    if valor > fecha_maxima:
        raise ValidationError(f"La fecha de vencimiento del DNI excede el límite razonable (20 años).")

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