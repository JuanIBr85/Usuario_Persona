from marshmallow import Schema, fields, validate

class UsuarioSchema(Schema):
    id_usuario = fields.Int(dump_only=True)
    nombre_usuario = fields.Str(required=True, validate=validate.Length(min=3))
    email_usuario = fields.Email(required=True)
    password = fields.Str(load_only=True, required=True, validate=validate.Length(min=4))
    persona_id = fields.Int(required=True)

    # Solo para devolver si querés mostrar timestamps
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    deleted_at = fields.DateTime(dump_only=True)
