from marshmallow import Schema, fields, validate


class MessageSchema(Schema):
    """
    Esquema para validar la estructura de los mensajes entre servicios.
    
    Atributos:
        from_service (str): Nombre del servicio que envía el mensaje.
        to_service (str): Nombre del servicio que recibe el mensaje.
        channel (str): Canal de envío del mensaje.
        event_type (str): Tipo de evento del mensaje.
        message (dict): Contenido del mensaje.
        message_id (str): Identificador único del mensaje.
    """
    from_service = fields.Str(
        required=True,
        validate=validate.Length(min=1),
        metadata={"description": "Nombre del servicio que envía el mensaje"}
    )
    
    to_service = fields.Str(
        required=True,
        validate=validate.Length(min=1),
        metadata={"description": "Nombre del servicio que recibe el mensaje"}
    )
    
    channel = fields.Str(
        required=True,
        validate=validate.Length(min=1),
        metadata={"description": "Canal de envío del mensaje"}
    )
    
    event_type = fields.Str(
        required=True,
        validate=validate.Length(min=1),
        metadata={"description": "Tipo de evento del mensaje"}
    )
    
    message = fields.Dict(
        required=True,
        metadata={"description": "Contenido del mensaje"}
    )
    
    message_id = fields.Str(
        required=True,
        validate=validate.Length(min=1),
        metadata={"description": "Identificador único del mensaje"}
    )


# Ejemplo de uso:
# from message_schema import MessageSchema
# 
# message = {
#     "from_service": "servicio_origen",
#     "to_service": "servicio_destino",
#     "channel": "canal_ejemplo",
#     "event_type": "tipo_evento",
#     "message": {"key": "value"},
#     "message_id": "id_unico_123"
# }
# 
# schema = MessageSchema()
# result = schema.load(message)  # Valida los datos
# print(result)  # Muestra los datos validados