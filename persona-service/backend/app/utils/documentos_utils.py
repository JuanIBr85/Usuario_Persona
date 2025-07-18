import logging
import re
from config import TIPOS_DOCUMENTO_VALIDOS


PESOS_CUIT = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]


def validar_cuit(cuit: str) -> bool:
    #https://wiki.python.org.ar/recetario/validarcuit/

    base = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

    cuit = cuit.replace("-", "") # remuevo las barras

    # calculo el digito verificador:
    aux = 0
    for i in range(10):
        aux += int(cuit[i]) * base[i]

    aux = 11 - (aux - (int(aux / 11) * 11))

    if aux == 11:
        aux = 0
    if aux == 10:
        aux = 9

    return aux == int(cuit[10])


def validar_documento_por_regex(documento: str, regex: str) -> bool:
    """Valida un número de documento según una expresión regular."""
    try:
        # Valido el documento contra el patron(regex)
        resultado = bool(re.match(regex, documento))
        return resultado
    except re.error:
        #logging.error(f"Error al validar documento {documento} con regex {regex}")
        return False


def validar_documento_por_tipo(tipo_documento: str, numero: str) -> bool | int:
    """Valida el número de documento según el tipo especificado."""

    if (
        numero is None
        or tipo_documento is None
        or tipo_documento not in TIPOS_DOCUMENTO_VALIDOS
    ):
        return False

    # Obtengo el regex
    regex = TIPOS_DOCUMENTO_VALIDOS[tipo_documento]

    # Valido el documento
    if not validar_documento_por_regex(numero, regex):
        return False

    if tipo_documento in {"CUIT", "CUIL"}:
        return True if validar_cuit(numero) else -4
    return True
