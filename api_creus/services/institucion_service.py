from models import db
from models.institucion_model import Institucion
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

class InstitucionService:
    """
    Servicio para gestionar las operaciones relacionadas con las instituciones.
    
    Este servicio proporciona métodos para realizar operaciones CRUD en las instituciones,
    así como consultas específicas para obtener información de las mismas.
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las instituciones registradas en el sistema.
        
        Returns:
            list: Lista de objetos Institucion.
        """
        try:
            return Institucion.query.all()
        except SQLAlchemyError as e:
            logger.error(f"Error al obtener todas las instituciones: {str(e)}")
            raise

    @staticmethod
    def get_by_id(institucion_id):
        """
        Obtiene una institución por su ID.
        
        Args:
            institucion_id (int): ID de la institución a buscar.
            
        Returns:
            Institucion: Instancia de la institución encontrada o None si no existe.
        """
        try:
            return Institucion.query.get(institucion_id)
        except SQLAlchemyError as e:
            logger.error(f"Error al obtener la institución con ID {institucion_id}: {str(e)}")
            raise

    @staticmethod
    def get_activas():
        """
        Obtiene todas las instituciones activas en el sistema.
        
        Returns:
            list: Lista de objetos Institucion que están activos.
        """
        try:
            return Institucion.query.filter_by(activo=True).all()
        except SQLAlchemyError as e:
            logger.error(f"Error al obtener instituciones activas: {str(e)}")
            raise

    @staticmethod
    def create(institucion_data):
        """
        Crea una nueva institución en el sistema.
        
        Args:
            institucion_data (dict): Diccionario con los datos de la institución.
                Debe contener los campos requeridos del modelo Institucion.
                
        Returns:
            Institucion: La instancia de la institución recién creada.
            
        Raises:
            ValueError: Si los datos proporcionados son inválidos.
            SQLAlchemyError: Si ocurre un error al guardar en la base de datos.
        """
        try:
            if not institucion_data or 'nombre' not in institucion_data:
                raise ValueError("Los datos de la institución son requeridos")
                
            institucion = Institucion(**institucion_data)
            db.session.add(institucion)
            db.session.commit()
            return institucion
            
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Error al crear la institución: {str(e)}")
            raise

    @staticmethod
    def update(institucion_id, update_data):
        """
        Actualiza los datos de una institución existente.
        
        Args:
            institucion_id (int): ID de la institución a actualizar.
            update_data (dict): Diccionario con los campos a actualizar.
                
        Returns:
            Institucion: La instancia de la institución actualizada o None si no se encontró.
            
        Raises:
            SQLAlchemyError: Si ocurre un error al actualizar en la base de datos.
        """
        try:
            institucion = Institucion.query.get(institucion_id)
            if not institucion:
                return None
                
            for key, value in update_data.items():
                if hasattr(institucion, key):
                    setattr(institucion, key, value)
                    
            db.session.commit()
            return institucion
            
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Error al actualizar la institución con ID {institucion_id}: {str(e)}")
            raise

    @staticmethod
    def delete(institucion_id):
        """
        Elimina una institución del sistema (borrado lógico).
        
        Args:
            institucion_id (int): ID de la institución a eliminar.
            
        Returns:
            bool: True si se eliminó correctamente, False si no se encontró la institución.
            
        Raises:
            SQLAlchemyError: Si ocurre un error al eliminar de la base de datos.
        """
        try:
            institucion = Institucion.query.get(institucion_id)
            if not institucion:
                return False
                
            # Borrado lógico en lugar de físico
            institucion.id_estado = 2
            db.session.commit()
            return True
            
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Error al eliminar la institución con ID {institucion_id}: {str(e)}")
            raise
