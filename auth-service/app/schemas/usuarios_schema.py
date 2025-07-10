from marshmallow import Schema, fields, validate,ValidationError,validates_schema,pre_load

"""
Schema: UsuarioInputSchema

Valida los datos de entrada para la creación de un nuevo usuario.

Campos:
- id_usuario (int): Solo para salida (`dump_only=True`).
- nombre_usuario (str): Obligatorio. Mínimo 4 caracteres.
- email_usuario (email): Obligatorio. Se transforma a minúsculas.
- password (str): Opcional. Requiere al menos 6 caracteres, mayúscula, minúscula, número y símbolo. Solo se carga (`load_only=True`).
- created_at / updated_at / deleted_at (datetime): Solo para salida (`dump_only=True`).

Validaciones:
- `email_usuario` se transforma automáticamente a minúsculas antes de la validación.
"""
class UsuarioInputSchema(Schema):
    id_usuario = fields.Int(
        dump_only=True
    )
    nombre_usuario = fields.Str(
        required=True, 
        validate=validate.Length(min=4, error="El nombre de usuario debe tener al menos 4 caracteres."),
        error_messages={"Requerimiento": "El nombre de usuario es obligatorio."}
    )
    email_usuario = fields.Email(
        required=True,
        error_messages={
            "required": "El email es obligatorio.",
            "invalid": "Debe ser un email válido."}
    )
    password = fields.Str(
        load_only=True, 
        required=False, 
        validate=[
            validate.Length(min=6, error="La contraseña debe tener al menos 6 caracteres."),
            validate.Regexp(
                    regex=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$",
                        error="La contraseña debe contener al menos una letra minúscula, " \
                        "una letra mayúscula, un número y un símbolo."
            )
        ],
        error_messages={"Requerido": "La contraseña es obligatoria."}
    )
    
    # Solo para devolver si querés mostrar timestamps
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    deleted_at = fields.DateTime(dump_only=True)

    @pre_load
    def lower_case_fields(self, data, **kwargs):
        if "email_usuario" in data and isinstance(data["email_usuario"], str):
            data["email_usuario"] = data["email_usuario"].lower()
        return data

"""
Schema: UsuarioOutputSchema

Define los datos devueltos al cliente luego del registro/login.

Campos:
- id_usuario (int)
- nombre_usuario (str)
- email_usuario (email)
- token (str): Token JWT devuelto al cliente.
"""
class UsuarioOutputSchema(Schema):
    id_usuario = fields.Int()
    nombre_usuario = fields.Str()
    email_usuario = fields.Email()
    token = fields.Str(
        required=True
    )

"""
Schema: LoginSchema

Valida las credenciales para el inicio de sesión.

Campos:
- email_usuario (email): Obligatorio. Se convierte a minúsculas.
- password (str): Obligatoria. Mínimo 6 caracteres.

Validaciones:
- `email_usuario` se transforma automáticamente a minúsculas.
"""
class LoginSchema(Schema):

    email_usuario = fields.Email(
        required=True,
        error_messages={
            "required": "El email es obligatorio.",
            "invalid": "Debe ser un email válido."}
    )
    password = fields.Str(
        required=True, 
        validate=validate.Length(min=6, error="La contraseña debe tener al menos 6 caracteres."),
        error_messages={"Requerido": "La contraseña es obligatoria."}
    )
    
    @pre_load
    def lower_case_email(self, data, **kwargs):
        if "email_usuario" in data and isinstance(data["email_usuario"], str):
            data["email_usuario"] = data["email_usuario"].lower()
        return data
"""
Schema: RecuperarPasswordSchema

Campos:
- email (email): Obligatorio. Usado para iniciar el flujo de recuperación de contraseña.
"""
class RecuperarPasswordSchema(Schema):
    email = fields.Email(required=True)

"""
Schema: ResetPasswordSchema

Valida la nueva contraseña ingresada por el usuario para el reseteo.

Campos:
- email (email): Obligatorio.
- password (str): Obligatoria. Reglas fuertes (longitud mínima, caracteres especiales, etc.).
- confirm_password (str): Obligatoria. Debe coincidir con `password`.

Validaciones:
- Las contraseñas deben coincidir (`validate_passwords_match`).
"""
class ResetPasswordSchema(Schema):

    email = fields.Email(
        required=True
    )

    password = fields.Str(
        load_only=True, 
        required=False, 
        validate=[
            validate.Length(min=6, error="La contraseña debe tener al menos 6 caracteres."),
            validate.Regexp(
                    regex=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$",
                    error="La contraseña debe contener al menos una letra minúscula, una letra mayúscula, " \
                    "un número y un símbolo."
            )
        ],
        error_messages={"Requerido": "La contraseña es obligatoria."}
    )
    confirm_password = fields.Str(
        load_only=True,
        required=True,
        error_messages={"required": "Debe repetir la contraseña."}
    )

    @validates_schema
    def validate_passwords_match(self, data, **kwargs):
        if data.get("password") != data.get("confirm_password"):
            raise ValidationError("Las contraseñas no coinciden.", field_name="confirm_password")
        

"""
Schema: UsuarioModificarSchema

Permite modificar el nombre del usuario.

Campos:
- nombre_usuario (str): Opcional. Mínimo 4 caracteres si se proporciona.
"""
class UsuarioModificarSchema(Schema):
    nombre_usuario = fields.Str(
        required=False,
        validate=validate.Length(min=4, error="El nombre de usuario debe tener al menos 4 caracteres.")
    )


"""
Schema: UsuarioModificarEmailSchema

Valida el cambio de email del usuario.

Campos:
- nuevo_email (email): Opcional. Se convierte a minúsculas si se proporciona.
- password (str): Opcional. Requiere validación fuerte (mínimo 6 caracteres, mayúsculas, símbolos, etc.).

Validaciones:
- `nuevo_email` se transforma automáticamente a minúsculas.
""" 
class UsuarioModificarEmailSchema(Schema):
        nuevo_email = fields.Email(
        required=False,
        error_messages={
            "invalido": "Debe ser un email válido."
        }
    )
        password = fields.Str(
            load_only=True, 
            required=False, 
            validate=[
                validate.Length(min=6, error="La contraseña debe tener al menos 6 caracteres."),
                validate.Regexp(
                        regex=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$",
                        error="La contraseña debe contener al menos una letra minúscula, una letra mayúscula, " \
                        "un número y un símbolo."
                )
            ],
            error_messages={"Requerido": "La contraseña es obligatoria."}
        )
        
        @pre_load
        def lower_case_fields(self, data, **kwargs):
            if "nuevo_email" in data and isinstance(data["nuevo_email"], str):
                data["nuevo_email"] = data["nuevo_email"].lower()
            return data

"""
Schema: UsuarioEliminarSchema

Usado para validar la eliminación lógica de un usuario.

Campos:
- email_usuario (email): Opcional. Puede mapearse desde `email`.
- password (str): Opcional. Requiere validación fuerte.

Validaciones:
- `email` se mapea automáticamente a `email_usuario` si está presente.
- `email_usuario` se transforma a minúsculas.
"""
class UsuarioEliminarSchema(Schema):
        email_usuario = fields.Email(
        required=False,
        error_messages={
            "invalido": "Debe ser un email válido."
        }
    )
        password = fields.Str(
            load_only=True, 
            required=False, 
            validate=[
                validate.Length(min=6, error="La contraseña debe tener al menos 6 caracteres."),
                validate.Regexp(
                        regex=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$",
                        error="La contraseña debe contener al menos una letra minúscula, una letra mayúscula, " \
                        "un número y un símbolo."
                )
            ],
            error_messages={"Requerido": "La contraseña es obligatoria."}
        )
        
        @pre_load
        def lower_case_fields(self, data, **kwargs):
            if "email_usuario" in data and isinstance(data["email_usuario"], str):
                data["email_usuario"] = data["email_usuario"].lower()
            return data
        
        @pre_load
        def map_fields(self, data, **kwargs):
            if "email" in data:
                data["email_usuario"] = data.pop("email")
            return data