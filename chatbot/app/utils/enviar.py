from app.extensions import mensajeWa


def enviar(telefonoRecibe, respuesta):
    """
    Envía un mensaje a un teléfono específico usando WhatsApp API.
    """
    telefonoRecibe = telefonoRecibe.replace("549", "54")
    mensajeWa.send_message(respuesta, telefonoRecibe)