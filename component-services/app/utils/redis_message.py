import threading
from flask import Flask
from app.extensions import redis_client_core as r, WORKER_ID, logger
import json

# component-service-internal-events
# Por que csie por que estaba aburrido y queria hacer algo distinto
GROUP_NAME = "csie"
STREAMS = {}

# Esto podria y posiblemente deberia de cambiarse por celery en el futuro

_redis_receiver = {}

# Decorador para registrar un receiver de eventos de redis
# Sirve como una forma de sincronizar workers, a futuro talvez se podria reutilizar
# stream_name sirve como un canal para los mensajes
def register_redis_receiver(stream_name: str):
    def decorador(f):
        # Define el nombre del "canal"
        _group_stream = f"{GROUP_NAME}_{stream_name}"

        # Si el canal ya esta registrado, lanza un error
        # No pueden haber dos metodos escuchando el mismo canal
        if _group_stream in _redis_receiver:
            raise ValueError(f"El stream {stream_name} ya esta registrado")

        # Si el metodo no es callable, lanza un error
        if not callable(f):
            raise ValueError("El decorador receiver solo puede ser usado con funciones")
        
        # Guarda el metodo en el diccionario
        _redis_receiver[_group_stream] = f

        # Guarda el stream en el diccionario
        # El $ indica que solo espera nuevos mensajes
        STREAMS[_group_stream] = "$"

        # Crea el grupo
        try:
            # Crea el stream(canal) si no existe
            r.xgroup_create(_group_stream, GROUP_NAME, id="$", mkstream=True)
        except Exception as e:
            # Ignora el error si el grupo ya existe
            # Cuando se esta en gunicorn, es muy probable que los workers provoquen este error
            if "BUSYGROUP" not in str(e):
                logger.error(f"Error al crear grupo en {_group_stream}: {str(e)}")
                raise

        return f

    return decorador


def redis_receiver(app: Flask):
    logger.info(f"Worker {WORKER_ID} conectado a Redis")

    while True:
        # 2hs luchando con esto, cloude es un angel
        # xread -> todos los workers reciben todos los mensajes
        # xreadgroup -> solo un worker recibe el mensajes
        mensajes = r.xread(
            # GROUP_NAME,  # MISMO grupo para todos
            # WORKER_ID,
            STREAMS,  # Solo mensajes nuevos
            count=1,  # Toma un mensaje a la vez
            block=200,  # Una especie de interval en ms (200ms)
        )

        # Recorro los mensajes
        for stream, eventos in mensajes:
            # Recorro los eventos del mensaje
            for msg_id, data in eventos:
                # Extraigo el mensaje
                message_data = json.loads(data["data"])

                # Ejecuto el receiver
                _redis_receiver[stream](app, message_data)

                r.xack(stream, GROUP_NAME, msg_id)


#Este endpoint esta escuchando el stream "test"
@register_redis_receiver("test")
def test(app: Flask, message_data: dict):
    logger.warning(f"Worker {WORKER_ID} recibio mensaje: {message_data}")


# Envio un evento a un stream
def send_event(stream_name: str, message_data: dict):
    _group_stream = f"{GROUP_NAME}_{stream_name}"

    if _group_stream not in _redis_receiver:
        raise ValueError(f"El stream {stream_name} no esta registrado")

    # Envio el evento al stream
    r.xadd(_group_stream, {"data": json.dumps(message_data)})


# Inicia el redis receiver
def redis_stream_start(app: Flask):
    import time

    def run():
        # Espero unos segundos para asegurarme de que se ejecute flask
        time.sleep(5)
        # Ejecuta el redis receiver con el contexto de flask
        with app.app_context():
            redis_receiver(app)

    t = threading.Thread(target=run)
    t.daemon = True
    t.start()
