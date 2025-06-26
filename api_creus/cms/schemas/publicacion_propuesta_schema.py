from marshmallow import Schema, fields, validates, ValidationError

class PublicacionPropuestaSchema(Schema):
    id = fields.Int(dump_only=True)
    id_propuesta_educativa = fields.Int(required=True)
    destacada = fields.Bool(load_default=False)
    posicion = fields.Int(allow_none=True)
    visible = fields.Bool(required=True)

    @validates("posicion")
    def validate_posicion(self, value):
        if value is not None and value not in [1, 2, 3]:
            raise ValidationError("La posición debe ser 1, 2 o 3.")