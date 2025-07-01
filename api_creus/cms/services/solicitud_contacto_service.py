from models import db
from cms.models.solicitud_contacto_model import SolicitudContacto
from datetime import datetime
from utils.response_utils import make_response, ResponseStatus

class SolicitudContactoService:
    @staticmethod
    def get_all():
        """Obtener todas las solicitudes de contacto"""
        try:
            solicitudes = SolicitudContacto.query.filter_by(visible=True).order_by(SolicitudContacto.fecha_creacion.desc()).all()
            
            if not solicitudes:
                return make_response(ResponseStatus.SUCCESS, "No hay solicitudes de contacto", data=[])
            
            data = [s.to_dict() for s in solicitudes]
            return make_response(ResponseStatus.SUCCESS, "Lista de solicitudes obtenida con éxito.", data=data)
        except Exception as e:
            return make_response(ResponseStatus.ERROR, f"Error al obtener solicitudes: {str(e)}")
    
    @staticmethod
    def get_by_id(id):
        """Obtener solicitud por ID"""
        try:
            solicitud = SolicitudContacto.query.filter_by(id=id, visible=True).first()
            if not solicitud:
                return make_response(ResponseStatus.FAIL, f"No se encontró la solicitud con ID: {id}", {"id": id})
                
            return make_response(ResponseStatus.SUCCESS, "Solicitud encontrada.", data=solicitud.to_dict())
        except Exception as e:
            return make_response(ResponseStatus.ERROR, f"Error al obtener solicitud: {str(e)}")
    
    @staticmethod
    def create(data):
        """Crear una nueva solicitud de contacto"""
        try:
            nueva_solicitud = SolicitudContacto(
                nombre=data.get('nombre'),
                apellido=data.get('apellido'),
                email=data.get('email'),
                telefono=data.get('telefono'),
                localidad=data.get('localidad'),
                mensaje=data.get('mensaje'),
                respondida=False,
                fecha_creacion=datetime.utcnow()
            )
            
            db.session.add(nueva_solicitud)
            db.session.commit()
            
            return make_response(ResponseStatus.SUCCESS, "Solicitud creada con éxito.", data=nueva_solicitud.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, f"Error al crear solicitud: {str(e)}")
    
    @staticmethod
    def update(id, data):
        """Actualizar una solicitud existente"""
        try:
            solicitud = SolicitudContacto.query.get(id)
            if not solicitud:
                return make_response(ResponseStatus.FAIL, f"No se encontró la solicitud con ID: {id}", {"id": id})
            
            # Actualizar campos permitidos
            if 'respondida' in data:
                solicitud.respondida = data['respondida']
                if data['respondida'] and not solicitud.fecha_respuesta:
                    solicitud.fecha_respuesta = datetime.utcnow()
                elif not data['respondida']:
                    solicitud.fecha_respuesta = None
            
            db.session.commit()
            
            return make_response(ResponseStatus.SUCCESS, "Solicitud actualizada con éxito.", data=solicitud.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, f"Error al actualizar solicitud: {str(e)}")
    
    @staticmethod
    def delete(id):
        """Eliminar una solicitud"""
        try:
            solicitud = SolicitudContacto.query.get(id)
            if not solicitud:
                return make_response(ResponseStatus.FAIL, f"No se encontró la solicitud con ID: {id}", {"id": id})
            
            db.session.delete(solicitud)
            db.session.commit()
            
            return make_response(ResponseStatus.SUCCESS, "Solicitud eliminada con éxito.")
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, f"Error al eliminar solicitud: {str(e)}")
    
    @staticmethod
    def get_pending():
        """Obtener solicitudes pendientes (no respondidas)"""
        try:
            solicitudes = SolicitudContacto.query.filter_by(respondida=False, visible=True).order_by(SolicitudContacto.fecha_creacion.desc()).all()
            
            data = [s.to_dict() for s in solicitudes]
            return make_response(ResponseStatus.SUCCESS, "Solicitudes pendientes obtenidas con éxito.", data=data)
        except Exception as e:
            return make_response(ResponseStatus.ERROR, f"Error al obtener solicitudes pendientes: {str(e)}")
    
    @staticmethod
    def get_answered():
        """Obtener solicitudes respondidas"""
        try:
            solicitudes = SolicitudContacto.query.filter_by(respondida=True, visible=True).order_by(SolicitudContacto.fecha_respuesta.desc()).all()
            
            data = [s.to_dict() for s in solicitudes]
            return make_response(ResponseStatus.SUCCESS, "Solicitudes respondidas obtenidas con éxito.", data=data)
        except Exception as e:
            return make_response(ResponseStatus.ERROR, f"Error al obtener solicitudes respondidas: {str(e)}")
    
    @staticmethod
    def soft_delete(id):
        """Eliminación lógica de una solicitud (cambiar visible a False)"""
        try:
            solicitud = SolicitudContacto.query.filter_by(id=id, visible=True).first()
            if not solicitud:
                return make_response(ResponseStatus.FAIL, f"No se encontró la solicitud con ID: {id}", {"id": id})
            
            solicitud.visible = False
            db.session.commit()
            
            return make_response(ResponseStatus.SUCCESS, "Solicitud eliminada correctamente.", data=solicitud.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, f"Error al eliminar solicitud: {str(e)}")