from marshmallow import Schema, fields, validate
from marshmallow.validate import Length, URL, OneOf


class ServiceSchema(Schema):
    """Esquema para la validación y serialización de servicios"""

    id_service = fields.Int(dump_only=True)

    # Datos del servicio
    service_name = fields.Str(required=True, validate=Length(max=100))
    service_description = fields.Str(required=True, validate=Length(max=255))

    # URL del servicio
    service_url = fields.Str(required=True, validate=URL())

    # Estado del servicio
    service_available = fields.Bool(required=False)

    # Estado del servicio
    service_wait = fields.Bool(required=False)

    # Indica si es un servicio core
    service_core = fields.Bool(dump_only=True)
    # Campos de auditoría
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    deleted_at = fields.DateTime(dump_only=True)
