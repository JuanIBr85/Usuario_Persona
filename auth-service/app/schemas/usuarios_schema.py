from marshmallow import Schema, fields, validate,ValidationError,validates_schema,pre_load

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

class UsuarioOutputSchema(Schema):
    id_usuario = fields.Int()
    nombre_usuario = fields.Str()
    email_usuario = fields.Email()
    token = fields.Str(
        required=True
    )

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

class RecuperarPasswordSchema(Schema):
    email = fields.Email(required=True)

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
        

class UsuarioModificarSchema(Schema):
    nombre_usuario = fields.Str(
        required=False,
        validate=validate.Length(min=4, error="El nombre de usuario debe tener al menos 4 caracteres.")
    )
    email_usuario = fields.Email(
        required=False,
        error_messages={
            "invalido": "Debe ser un email válido."
        }
    )
    @pre_load
    def lower_case_fields(self, data, **kwargs):
        if "email_usuario" in data and isinstance(data["email_usuario"], str):
            data["email_usuario"] = data["email_usuario"].lower()
        return data
    