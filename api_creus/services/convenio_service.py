from models import db
from models.convenioModel import Convenio
from datetime import datetime

class ConvenioService:
    """Service class for handling convention-related operations."""

    @staticmethod
    def get_all():
        """Retrieve all conventions."""
        return Convenio.query.all()

    @staticmethod
    def get_by_id(convenio_id):
        """Retrieve a convention by its ID."""
        return Convenio.query.get(convenio_id)

    @staticmethod
    def get_activos():
        """Retrieve all active conventions."""
        return Convenio.query.filter_by(activo=True).all()

    @staticmethod
    def get_by_institucion(institucion_id):
        """Retrieve all conventions for a specific institution."""
        return Convenio.query.filter_by(id_institucion=institucion_id).all()

    @staticmethod
    def create(convenio_data):
        """Create a new convention."""
        # Convert string dates to date objects
        if 'fecha_inicio' in convenio_data and isinstance(convenio_data['fecha_inicio'], str):
            convenio_data['fecha_inicio'] = datetime.strptime(convenio_data['fecha_inicio'], '%Y-%m-%d').date()
        if 'fecha_fin' in convenio_data and convenio_data['fecha_fin'] and isinstance(convenio_data['fecha_fin'], str):
            convenio_data['fecha_fin'] = datetime.strptime(convenio_data['fecha_fin'], '%Y-%m-%d').date()
            
        convenio = Convenio(**convenio_data)
        db.session.add(convenio)
        db.session.commit()
        return convenio

    @staticmethod
    def update(convenio_id, update_data):
        """Update an existing convention."""
        convenio = Convenio.query.get(convenio_id)
        if not convenio:
            return None
            
        # Convert string dates to date objects if they exist
        if 'fecha_inicio' in update_data and isinstance(update_data['fecha_inicio'], str):
            update_data['fecha_inicio'] = datetime.strptime(update_data['fecha_inicio'], '%Y-%m-%d').date()
        if 'fecha_fin' in update_data and update_data['fecha_fin'] and isinstance(update_data['fecha_fin'], str):
            update_data['fecha_fin'] = datetime.strptime(update_data['fecha_fin'], '%Y-%m-%d').date()
        
        for key, value in update_data.items():
            setattr(convenio, key, value)
            
        db.session.commit()
        return convenio

    @staticmethod
    def delete(convenio_id):
        """Delete a convention (soft delete by setting activo=False)."""
        convenio = Convenio.query.get(convenio_id)
        if not convenio:
            return False
            
        convenio.activo = False
        db.session.commit()
        return True
