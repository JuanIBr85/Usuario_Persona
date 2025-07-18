from marshmallow import fields, validate,pre_load
from marshmallow.validate import Length,Email
from app.schema.base_schema import BaseSchema
from config import REDES_SOCIALES_VALIDAS
from app.utils.vacios import permitir_vacios
from app.utils.validar_string import (
    validar_referencias,
    validar_telefono,
    validar_red_social_contacto
)


class ContactoSchema(BaseSchema):

    id_contacto=fields.Int(dump_only=True)
    telefono_fijo=fields.Str(validate = validar_telefono)
    telefono_movil=fields.Str(required=True,
            validate=[
                validate.Length(min=1, error="El número de teléfono no puede estar vacío"),
                validar_telefono
            ])
    red_social_contacto=fields.Str(validate = validar_red_social_contacto)
    red_social_nombre=fields.Str(allow_none=True, required=False, validate=permitir_vacios(REDES_SOCIALES_VALIDAS))
    email_contacto = fields.Emails(
        required=True,
        validate=[
            validate.Regexp(
                r"^[^+\s]+@[^\s@]+\.[^\s@]+$",
                error="El email no puede contener espacios ni alias (signo '+')"
            ),
            validate.Length(min=1, error="El email no puede estar vacío.")
        ],
        error_messages={
            "required": "El email es obligatorio.",
            "invalid": "Debe ser un email válido."
        }
    )
    observacion_contacto=fields.Str(validate = validar_referencias)    

    created_at=fields.DateTime(dump_only=True)
    updated_at=fields.DateTime(dump_only=True)
    deleted_at=fields.DateTime(dump_only=True)

    @pre_load
    def limpiar_espacios_contacto(self, data, **kwargs):
        campos_a_limpiar = [
            'telefono_fijo',
            'telefono_movil',
            'red_social_contacto',
            'email_contacto',
            'observacion_contacto'
        ]
        for campo in campos_a_limpiar:
            if campo in data and isinstance(data[campo], str):
                data[campo] = data[campo].strip()
        return data