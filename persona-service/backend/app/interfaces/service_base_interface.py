from abc import ABC, abstractmethod
from typing import Any, Callable, List
from sqlalchemy.orm import Session, Query


from abc import ABC, abstractmethod
from typing import Any, Callable, List
from sqlalchemy.orm import Session, Query

class IServicioBase(ABC):
    """
    Interfaz base para servicios de acceso y manipulación de datos.
    Define un contrato común para operaciones CRUD, validación, consultas
    personalizadas y ejecución dentro de una sesión de base de datos.
    """

    @abstractmethod
    def get_all(self) -> dict | list[dict]:
        """
        Obtiene todos los registros disponibles.

        Returns:
            dict | list[dict]: Lista de registros como diccionarios, o un único
            diccionario si aplica.
        """
        pass

    @abstractmethod
    def get_by_id(self, id: int) -> dict | None:
        """
        Recupera un registro por su ID.

        Args:
            id (int): Identificador del registro.

        Returns:
            dict | None: El registro si existe, o None.
        """
        pass

    @abstractmethod
    def exist(self, id: int) -> bool:
        """
        Verifica si un registro con el ID dado existe.

        Args:
            id (int): Identificador del registro.

        Returns:
            bool: True si existe, False en caso contrario.
        """
        pass

    @abstractmethod
    def create(self, data: Any) -> dict | None:
        """
        Crea un nuevo registro con los datos proporcionados.

        Args:
            data (Any): Información necesaria para crear el nuevo registro.

        Returns:
            dict | None: El registro creado o None si hubo un error.
        """
        pass

    @abstractmethod
    def update(self, data: Any) -> dict | None:
        """
        Actualiza un registro existente con los datos proporcionados.

        Args:
            data (Any): Información con los cambios (incluye el ID del registro).

        Returns:
            dict | None: El registro actualizado o None si no se encontró.
        """
        pass

    @abstractmethod
    def delete(self, id: int) -> None:
        """
        Elimina un registro según su ID.

        Args:
            id (int): Identificador del registro a eliminar.
        """
        pass

    @abstractmethod
    def query(self, query_callback: Callable[[Query[Any]], Any]) -> Any:
        """
        Ejecuta una consulta personalizada sobre el modelo.

        Args:
            query_callback (Callable): Función que recibe un objeto `Query` para construir la consulta.

        Returns:
            Any: Resultado de la consulta.
        """
        pass

    @abstractmethod
    def validate(self, data: Any, partial:bool) -> tuple[bool, List]:
        """
        Valida los datos antes de operaciones de base de datos.

        Args:
            data (Any): Datos a validar.
            partial (bool): Validacion parcial del esquema.

        Returns:
            tuple[bool, List]: Tupla con un booleano indicando si es válido,
            y una lista de errores si los hay.
        """
        pass

    @abstractmethod
    def _run_with_session(self, session_callback: Callable[[Session], Any]) -> dict | list[dict] | None:
        """
        Ejecuta una operación dentro de una sesión de base de datos.

        Args:
            session_callback (Callable): Función que recibe una sesión activa y ejecuta lógica.

        Returns:
            dict | list[dict] | None: Resultado de la operación.
        """
        pass

