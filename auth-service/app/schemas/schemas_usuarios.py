from marshmallow import Schema, fields, validate

class UsuarioSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre_usuario = fields.Str(required=True, validate=validate.Length(min=3))
    email_usuario = fields.Email(required=True)
    password = fields.Str(load_only=True, required=True, validate=validate.Length(min=4))

