# ==== ERRORES RELACIONADOS A USUARIO ====

# 404 - El recurso (usuario) no fue encontrado
EMAIL_NOT_FOUND = "EMAIL_NOT_FOUND"  # 404

# 409 - Conflicto: el nombre de usuario ya existe
USERNAME_ALREADY_REGISTERED = "USERNAME_ALREADY_REGISTERED"  # 409

# 409 - Conflicto: el email ya fue registrado
EMAIL_ALREADY_REGISTERED = "EMAIL_ALREADY_REGISTERED"  # 409

# 403 - Prohibido: el usuario no está activo
USER_NOT_ACTIVE = "USER_NOT_ACTIVE"  # 403

# 400 - Solicitud incorrecta: ya estaba verificado
USER_ALREADY_VERIFIED = "USER_ALREADY_VERIFIED"  # 400


# ==== ERRORES RELACIONADOS A CONTRASEÑAS ====

# 401 - No autorizado: contraseña incorrecta
INVALID_PASSWORD = "INVALID_PASSWORD"  # 401

# 400 - Solicitud incorrecta: misma contraseña anterior
PASSWORD_SAME_AS_OLD = "PASSWORD_SAME_AS_OLD"  # 400

# 400 - Solicitud incorrecta: las contraseñas no coinciden
PASSWORDS_DO_NOT_MATCH = "PASSWORDS_DO_NOT_MATCH"  # 400


# ==== ERRORES RELACIONADOS A OTP / VERIFICACIÓN ====

# 400 - Solicitud incorrecta: OTP incorrecto
INVALID_OTP = "INVALID_OTP"  # 400

# 400 - Solicitud incorrecta: OTP expirado
EXPIRED_OTP = "EXPIRED_OTP"  # 400

# 404 - No encontrado: no hay OTP generado
OTP_NOT_FOUND = "OTP_NOT_FOUND"  # 404


# ==== ERRORES DE VALIDACIÓN DE DATOS ====

# 400 - Error de validación del schema
SCHEMA_VALIDATION_ERROR = "SCHEMA_VALIDATION_ERROR"  # 400

# 400 - Error de validación de datos fuera del schema
INVALID_INPUT = "INVALID_INPUT"  # 400


# ==== ERRORES DE AUTENTICACIÓN Y AUTORIZACIÓN ====

# 401 - No autorizado: token faltante
MISSING_TOKEN = "MISSING_TOKEN"  # 401

# 401 - No autorizado: token inválido
TOKEN_INVALID = "TOKEN_INVALID"  # 401

# 401 - No autorizado: token expirado
TOKEN_EXPIRED = "TOKEN_EXPIRED"  # 401

# 403 - Prohibido: sin permisos suficientes
UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"  # 403


# ==== ERRORES DE INFRAESTRUCTURA / SERVIDOR ====

# 500 - Error interno del servidor al enviar correo
EMAIL_SENDING_ERROR = "EMAIL_SENDING_ERROR"  # 500

# 500 - Error interno del servidor: base de datos
DATABASE_ERROR = "DATABASE_ERROR"  # 500

# 500 - Error desconocido
UNKNOWN_ERROR = "UNKNOWN_ERROR"  # 500
