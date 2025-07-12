from cachetools import TTLCache
from typing import Callable, Any, TypeVar, Generic


class TTLCacheUtil(TTLCache):
    """
    Una implementación de caché con tiempo de vida (TTL) que extiende TTLCache de cachetools.
    
    Esta clase proporciona una interfaz simplificada para el almacenamiento en caché con expiración,
    siguiendo el patrón LRU (Least Recently Used) cuando se alcanza el tamaño máximo.
    
    Args:
        maxsize: Número máximo de elementos en la caché. 0 o None para tamaño ilimitado.
        ttl: Tiempo de vida de los elementos en segundos.
    """
    def __init__(self, maxsize: int, ttl: int):
        """
        Inicializa la caché con el tamaño máximo y tiempo de vida especificados.
        
        Args:
            maxsize: Número máximo de elementos en la caché.
            ttl: Tiempo de vida de los elementos en segundos.
        """
        super().__init__(maxsize=maxsize, ttl=ttl)

    def get_or_cache(self, key: str, callback: Callable[[], Any]) -> Any:
        """
        Obtiene un valor de la caché por su clave, o lo calcula y lo almacena si no existe.
        
        Args:
            key: Clave del elemento a buscar o almacenar.
            callback: Función que se ejecutará para calcular el valor si la clave no existe.
            
        Returns:
            El valor almacenado en caché o el resultado de ejecutar el callback.
            
        Example:
            >>> cache = TTLCacheUtil(maxsize=100, ttl=300)  # 5 minutos de TTL
            >>> def obtener_datos():
            ...     # Lógica costosa aquí
            ...     return "datos_calculados"
            >>> 
            >>> # Obtiene datos del caché o los calcula si no existen
            >>> datos = cache.get_or_cache('clave_datos', obtener_datos)
        """
        if key in self:
            return self[key]

        data = callback()
        
        self[key] = data
        return data