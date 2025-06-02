from marshmallow import Schema, fields, validates, ValidationError

class RolInputSchema(Schema):
    nombre = fields.String(required=True)
    descripcion = fields.String(required=False, allow_none=True)
    permisos = fields.List(fields.String(), required=True)

    @validates("permisos")
    def validar_permisos(self, value):
        if not value:
            raise ValidationError("Debe especificar al menos un permiso")