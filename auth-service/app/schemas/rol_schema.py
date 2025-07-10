from marshmallow import Schema, fields, validates, ValidationError

"""
Schema: RolInputSchema

Este schema define y valida la estructura esperada para la creación o modificación de un rol.

Campos:
- nombre (str): Nombre del rol. Obligatorio.
- descripcion (str | None): Descripción opcional del rol.
- permisos (List[str]): Lista de permisos a asignar al rol. Obligatoria.

Reglas de validación:
- La lista de permisos no puede estar vacía.
"""

class RolInputSchema(Schema):
    nombre = fields.String(required=True)
    descripcion = fields.String(required=False, allow_none=True)
    permisos = fields.List(fields.String(), required=True)

    @validates("permisos")
    def validar_permisos(self, value):
        if not value:
            raise ValidationError("Debe especificar al menos un permiso")