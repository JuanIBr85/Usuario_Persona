from marshmallow import Schema, fields, validate

class UsuarioSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    nombre = fields.Str()
    apellido = fields.Str()
    email = fields.Email()
    rol = fields.Str(validate=validate.OneOf(['admin', 'usuario']))