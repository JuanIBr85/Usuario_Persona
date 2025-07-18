import re
from marshmallow import ValidationError


def validar_nombre_apellido(valor: str) -> str:

    """Valida que un string (nombre y apellido) contenga solo letras y espacios simples."""

    if valor is None:
        raise ValidationError("Valor requerido")

    valor = valor.strip()
    patron = r'^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$'

    if not valor:
        raise ValidationError("Por favor completar el dato correspondiente. No puede estar vacío")

    if not re.fullmatch(patron, valor):
        raise ValidationError(
            "Sólo se permiten letras, no se pueden utilizar caracteres especiales."
        )

    return valor


def validar_nombre_calle(valor: str) -> str:
    """Valida que el nombre de la calle sea válido y sin espacios sobrantes."""
    if valor is None:
        raise ValidationError("Valor requerido")

    valor = valor.strip()
    patron = r'^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9]+)*$'

    if not valor:
        raise ValidationError("No puede estar vacío")

    if not re.fullmatch(patron, valor):
        raise ValidationError(
            "Sólo se permiten letras, números y un espacio entre cada palabra"
        )

    return valor
'''
# validador generico
def validar_campos_strings(valor: str, *,
                           campo: str = "Campo",
                           requerido: bool = True,
                           patron: str,
                           mensaje_vacio: str = None,
                           mensaje_patron: str = None) -> str:
    """
    Valida un campo (string) en base a un patrón de expresión regular.
    
    Args:
        valor: El valor del campo a validar.
        campo: Nombre del campo (para usar en errores).
        requerido: Si el valor puede ser None.
        patron: Expresión regular para validar.
        mensaje_vacio: Mensaje de error si el campo está vacío.
        mensaje_patron: Mensaje de error si no coincide con el patrón.

    Returns:
        El valor saneado (con espacios recortados).

    Raises:
        ValidationError: Si el valor es inválido.
    """

    if requerido and valor is None:
        raise ValidationError(f"{campo} requerido")

    valor = valor.strip() if valor else ""

    if not valor:
        raise ValidationError(mensaje_vacio or f"{campo} no puede estar vacío")

    if not re.fullmatch(patron, valor):
        raise ValidationError(mensaje_patron or f"{campo} contiene caracteres inválidos")

    return valor
'''
