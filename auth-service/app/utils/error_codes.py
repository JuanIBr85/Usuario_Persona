# app/utils/error_codes.py

# ==== ERRORES RELACIONADOS A USUARIO ====

# El correo no está registrado en la base de datos
EMAIL_NOT_FOUND = "EMAIL_NOT_FOUND"

# El nombre de usuario ya existe
USERNAME_ALREADY_REGISTERED = "USERNAME_ALREADY_REGISTERED"

# El correo electrónico ya fue registrado anteriormente
EMAIL_ALREADY_REGISTERED = "EMAIL_ALREADY_REGISTERED"

# El usuario existe pero no está activo (pendiente de activación, eliminado, etc.)
USER_NOT_ACTIVE = "USER_NOT_ACTIVE"

# El usuario ya había verificado previamente su correo
USER_ALREADY_VERIFIED = "USER_ALREADY_VERIFIED"


# ==== ERRORES RELACIONADOS A CONTRASEÑAS ====

# Contraseña incorrecta durante login u otro proceso
INVALID_PASSWORD = "INVALID_PASSWORD"

# La nueva contraseña coincide con la anterior
PASSWORD_SAME_AS_OLD = "PASSWORD_SAME_AS_OLD"

# Las contraseñas ingresadas no coinciden
PASSWORDS_DO_NOT_MATCH = "PASSWORDS_DO_NOT_MATCH"


# ==== ERRORES RELACIONADOS A OTP / VERIFICACIÓN ====

# El código ingresado es incorrecto o no coincide
INVALID_OTP = "INVALID_OTP"

# El código ha expirado (según timestamp)
EXPIRED_OTP = "EXPIRED_OTP"

# No se encontró un código asociado al usuario o no fue generado
OTP_NOT_FOUND = "OTP_NOT_FOUND"


# ==== ERRORES DE VALIDACIÓN DE DATOS ====

# El esquema de validación de Marshmallow no fue pasado
SCHEMA_VALIDATION_ERROR = "SCHEMA_VALIDATION_ERROR"

# Algún dato de entrada no cumple con los formatos esperados (fuera de schema o validaciones adicionales)
INVALID_INPUT = "INVALID_INPUT"


# ==== ERRORES DE AUTENTICACIÓN Y AUTORIZACIÓN ====

# El token no fue proporcionado o no está en el encabezado Authorization
MISSING_TOKEN = "MISSING_TOKEN"

# El token proporcionado es inválido (firma incorrecta, datos corruptos, etc.)
TOKEN_INVALID = "TOKEN_INVALID"

# El token JWT ha expirado
TOKEN_EXPIRED = "TOKEN_EXPIRED"

# El usuario no tiene permisos para realizar esta acción
UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"


# ==== ERRORES DE INFRAESTRUCTURA / SERVIDOR ====

# Hubo un error al enviar el correo (SMTP, red, etc.)
EMAIL_SENDING_ERROR = "EMAIL_SENDING_ERROR"

# Error de base de datos inesperado (ej: IntegrityError, SQL mal formado)
DATABASE_ERROR = "DATABASE_ERROR"

# Error no identificado o genérico (try/except general)
UNKNOWN_ERROR = "UNKNOWN_ERROR"
