from typing import Callable, Any
from app.extensions import redis_client_cache as r
from cachetools import TTLCache
import pickle

class RedisCacheUtil(TTLCache):
    """
        Esta clase es un cache que genera un cache intermedio entre redis y TTLCache
        para evitar la llamadas repetitivas a redis y mejorar el rendimiento
    """

    def __init__(self, maxsize, ttl):
        """
        Inicializa la caché con el tamaño máximo y tiempo de vida especificados.
        
        Args:
            maxsize: Número máximo de elementos en la caché.
            ttl: Tiempo de vida de los elementos en segundos.
        """
        super().__init__(maxsize, ttl)

    def from_cache(self, key: str, ttl:int, callback: Callable[[], Any]) -> Any:
        """
        Obtiene un valor de la caché por su clave, o lo calcula y lo almacena si no existe.
        
        Args:
            key: Clave del elemento a buscar o almacenar.
            callback: Función que se ejecutará para calcular el valor si la clave no existe.
            
        Returns:
            El valor almacenado en caché o el resultado de ejecutar el callback.
            
        Example:
            >>> cache = RedisCacheUtil(maxsize=100, ttl=300)  # 5 minutos de TTL
            >>> def obtener_datos():
            ...     # Lógica costosa aquí
            ...     return "datos_calculados"
            >>> 
            >>> # Obtiene datos del caché o los calcula si no existen
            >>> datos = cache.from_cache('clave_datos', 10, obtener_datos)#almacena los datos 10s

        """
        # Compruebo primero si esta en cache la respuesta
        if key in self:
            return self[key]

        #Compruebo si esta en redis la respuesta
        retrieved_data = r.get(key)
        if retrieved_data:
            # Deserializo la respuesta
            data = pickle.loads(retrieved_data)
            # Guardo los datos en el cache
            self[key]= data
            return data

        #Si no esta ni en el cache ni redis se genera la respuesta
        data = callback()
        self[key]= data

        #Serializo los datos
        serialized_data = pickle.dumps(data)

        #Los guardo en redis con una expiracion igual al del TTLCache
        r.set(key, serialized_data)
        r.expire(key, ttl)

        return data