from marshmallow import Schema, fields, validate
#
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
        required=True, 
        validate=[
            validate.Length(min=6, error="La contraseña debe tener al menos 6 caracteres."),
            validate.Regexp(
                regex=r"^(?=.*[0-9])(?=.*[!@#$%^&*(),.?\":{}|<>]).+$",
                error="La contraseña debe contener al menos un número y un símbolo."
            )
        ],
        error_messages={"Requerido": "La contraseña es obligatoria."}
    )
    
    persona_id = fields.Int(
        required=False, 
        allow_none=True
    )        #cuando la tabla de la db persona este conectada cambiar a: persona_id = fields.Int(required=True)

    # Solo para devolver si querés mostrar timestamps
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    deleted_at = fields.DateTime(dump_only=True)

"""class UsuarioOutputSchema(Schema):
    id_usuario = fields.Int()
    nombre_usuario = fields.Str()
    email_usuario = fields.Email()
    persona_id = fields.Int()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    deleted_at = fields.DateTime()"""

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

