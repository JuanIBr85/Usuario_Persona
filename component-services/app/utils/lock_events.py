from app.extensions import redis_client_core
from typing import Callable

# Funcion para crear un lock de redis, para evitar que multiples workers se pisen entre si
def make_lock_event(name):
        
    return redis_client_core.lock(
        name=f"component:lock:event:{name}",
        timeout=60,            # caducidad automática en segundos
        blocking=True,         # espera a obtener el lock (True/False)
        blocking_timeout=10,   # tiempo máximo de espera (segundos)
        thread_local=True      # opcional, asegura ámbito de hilo
    )

# Para usar el lock de forma segura
def acquire_lock(lock_event, callback: Callable[[], None], event_name: str):
    # Si no hay lock_event, significa que el evento ya fue procesado
    if lock_event is None:
        return False
        
    if lock_event.acquire():
        try:
            # Verificar por si otro worker ya procesó el evento
            event_key = f"component:event:processed:{event_name}"
            if redis_client_core.exists(event_key):
                return False
                
            # Ejecutar el callback
            callback()
            
            # Marcar el evento como procesado 
            # solo permite enviar un evento del mismo tipo cada 60 segundos
            redis_client_core.setex(event_key, 60, "1")
            return True
        finally:
            lock_event.release()