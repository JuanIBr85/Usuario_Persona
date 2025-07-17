from marshmallow import Schema, fields, validates, ValidationError,validate

# Reutilizable: limita la cantidad de espacios en un string
def max_spaces(max_allowed):
    def _validator(value: str):
        if value.count(" ") > max_allowed:
            raise ValidationError(f"No se permiten más de {max_allowed} espacios.")
    return _validator

# Opcional: valida que los strings no estén vacíos o con solo espacios
def non_empty_trimmed_string(value: str):
    if not value.strip():
        raise ValidationError("El campo no puede estar vacío o contener solo espacios.")


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
    nombre = fields.String(
        required=True,
        validate=[
            validate.Length(min=5, max=16, error="El nombre debe tener entre 5 y 16 caracteres."),
            validate.Regexp(r"^[^\n\r\t]+$", error="No se permiten saltos de línea ni tabulaciones."),
            max_spaces(3)
        ],
        error_messages={"required": "El nombre es obligatorio."}
    )

    descripcion = fields.String(
        required=False,
        allow_none=True,
        validate=[
            validate.Length(min=5, max=150, error="La descripción debe tener entre 5 y 100 caracteres.")
        ]
    )
    permisos = fields.List(
        fields.String(validate=non_empty_trimmed_string), 
        required=True
    )

    @validates("permisos")
    def validar_permisos(self, value):
        if not value:
            raise ValidationError("Debe especificar al menos un permiso")