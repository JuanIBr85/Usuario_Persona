import re
from marshmallow import ValidationError

#--------------------------------------------------------------------------
#Validador relacionado a persona
#--------------------------------------------------------------------------
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

#--------------------------------------------------------------------------
#Validadores relacionados a domicilio
#--------------------------------------------------------------------------

def validar_domicilio_calle(valor: str) -> str:

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

def validar_domicilio_numero(valor: str) -> str:

    """Valida que el número del domicilio sea numérico (opcionalmente con una letra) o 's/n'."""

    if valor is None:
        raise ValidationError("Número requerido")

    valor = valor.strip().lower()

    if not valor:
        raise ValidationError("El número no puede estar vacío")

    if valor == "s/n":
        return valor.upper()  

    patron = r'^\d{1,5}[a-zA-Z]?$'
    if not re.fullmatch(patron, valor):
        raise ValidationError("Formato inválido. Ejemplos válidos: '123', '123B', 's/n'")

    return valor.upper()


def validar_domicilio_piso(valor: str) -> str:

    """Valida que el piso sea alfanumérico simple o abreviaturas como 'PB'."""

    if valor is None:
        return ""  # no es requerido

    valor = valor.strip()
    patron = r'^[0-9]{1,2}[A-Za-z]?$|^[Pp][Bb]$'

    if not re.fullmatch(patron, valor):
        raise ValidationError("Formato de piso inválido. Ejemplos válidos: '3', '3A', 'PB'")

    return valor

def validar_domicilio_dpto(valor: str) -> str:
    """Valida que el departamento sea una cadena alfanumérica corta (1-5 caracteres)."""
    if valor is None:
        return ""  # No requerido

    valor = valor.strip()

    if not valor:
        return ""  # Permitido vacío

    patron = r'^[A-Za-z0-9]{1,5}$'
    if not re.fullmatch(patron, valor):
        raise ValidationError("Departamento inválido. Máximo 5 caracteres alfanuméricos sin símbolos ni espacios.")

    return valor

def validar_referencias(valor: str) -> str:

    """Valida que la referencia del domicilio tenga hasta 150 caracteres y contenido limpio."""

    if valor is None:
        return ""
    
    valor = valor.strip()

    if len(valor) > 150:
        raise ValidationError("La referencia no puede superar los 150 caracteres")

    patron = r'^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9 ,.\-()#]+$'
    if not re.fullmatch(patron, valor):
        raise ValidationError("Sólo se permiten letras, números y signos de puntuación comunes")

    return valor

#--------------------------------------------------------------------------
#Validadores relacionados a contacto
#--------------------------------------------------------------------------


def validar_telefono(valor: str) -> str:

    """Valida que el teléfono contenga sólo números y guiones."""

    if valor is None:
        return ""
    
    valor = valor.strip()
    patron = r'^[\d\- ]{6,20}$'

    if not re.fullmatch(patron, valor):
        raise ValidationError("El teléfono solo puede contener números, guiones y espacios")

    return valor

def validar_red_social_contacto(valor: str) -> str:

    """Valida que el nombre de usuario en la red social tenga caracteres válidos."""

    if valor is None:
        return ""

    valor = valor.strip()
    patron = r'^[A-Za-z0-9@._\-]{3,50}$'

    if not re.fullmatch(patron, valor):
        raise ValidationError("La red social contiene caracteres inválidos")

    return valor

#--------------------------------------------------------------------------
#Validador relacionado a persona extendida
#--------------------------------------------------------------------------


def validar_foto_perfil(valor: str) -> str:

    """Valida que la foto de perfil sea una URL válida o una ruta/nombre de archivo con extensión de imagen."""

    if not valor:
        return ""

    valor = valor.strip()

    patron_url = r'^https?://[^\s]+?\.(jpg|jpeg|png|gif|webp|bmp)$'
    patron_ruta = r'^[\w\-/\.]+?\.(jpg|jpeg|png|gif|webp|bmp)$'

    if re.fullmatch(patron_url, valor, re.IGNORECASE):
        return valor  # Es una URL válida

    if re.fullmatch(patron_ruta, valor, re.IGNORECASE):
        return valor  # Es una ruta válida

    raise ValidationError("La imagen debe ser una URL o ruta válida con formato .jpg, .png, .gif, etc.")






