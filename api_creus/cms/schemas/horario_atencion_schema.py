from marshmallow import Schema, fields, validates_schema, ValidationError, validate
from datetime import datetime
from utils.validation_utils import not_blank, SacaEspacios

class HorarioAtencionSchema(SacaEspacios, Schema):
    id = fields.Int(dump_only=True)

    dia = fields.Str(
        required=True,
        validate=[validate.Length(max=255), not_blank]
    )

    hora_inicio = fields.Time(
        required=True,
        format='%H:%M',
        error_messages={"invalid": "El formato debe ser HH:MM"}
    )

    hora_cierre = fields.Time(
        required=True,
        format='%H:%M',
        error_messages={"invalid": "El formato debe ser HH:MM"}
    )

    visible = fields.Boolean(required=True)

    @validates_schema
    def validar_horas(self, data, **kwargs):
        """
        Validar que hora_inicio < hora_cierre
        """
        if 'hora_inicio' in data and 'hora_cierre' in data:
            if data['hora_inicio'] >= data['hora_cierre']:
                raise ValidationError("La hora de inicio debe ser anterior a la de cierre.", field_name="hora_inicio")