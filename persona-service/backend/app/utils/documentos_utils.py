DOC_CARACTERES = {
    "DNI": 8,
    "LE": 8,
    "LC": 8,
    "CI": 8,
    "Pasaporte": 9,
    "CUIT": 11,
    "CUIL": 11,
}

PESOS_CUIT = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]


def validar_cuit(cuit: str) -> bool:

    """Valida un CUIT/CUIL utilizando el algoritmo de módulo 11.
    XX - YYYYYYYY - Z
    |    |          |
    |    |          --> Dígito verificador
    |    --> Número de documento (8 dígitos)
    --> Prefijo (20, 23, 24, 27, 30, 33, 34)

    """
    if cuit is None:
        return False
    
    cuit = str(cuit).replace("-", "")
    if len(cuit) != 11 or not cuit.isdigit():
        return False
    
    digitos = [int(d) for d in cuit]
    total = sum(d * w for d, w in zip(digitos[:10], PESOS_CUIT))
    modulo = 11 - (total % 11)

    if modulo == 11:
        verifica_digito = 0
    elif modulo == 10:
        verifica_digito = 9
    else:
        verifica_digitos = modulo
    return digitos[-1] == verifica_digitos


def validar_documento_por_tipo(tipo_documento: str, numero: str) -> bool:

    """Valida el número de documento según el tipo especificado."""

    if numero is None or tipo_documento is None:
        return False
    
    numero = str(numero).replace("-", "")
    requerido = DOC_CARACTERES.get(tipo_documento)
    if requerido:
        if len(numero) != requerido:
            return False
        if not numero.isdigit():
            return False
    if tipo_documento in {"CUIT", "CUIL"}:
        return validar_cuit(numero)
    return True