from models.estado_model import Estado
from models import db
from utils.response_utils import make_response, ResponseStatus

class EstadoService:
    @staticmethod
    def get_all():
        # Traer todos los estados
        estados = Estado.query.all()

        if not estados:
            return (make_response(ResponseStatus.SUCCESS, "No hay estados", data=[]), 204,)

        data = [e.to_dict() for e in estados]
        return (make_response(ResponseStatus.SUCCESS, "Lista de estados obtenida con éxito.", data), 200,)
    
    @staticmethod
    def get_by_id(id):
        # Obtener estado por id
        estado = Estado.query.get(id)
        if not estado:
            return (make_response(ResponseStatus.FAIL, f"No se encontró el estado con ID: {id}", {"id": id}), 404,)
            
        return (make_response(ResponseStatus.SUCCESS, "Estado encontrado.", data=estado.to_dict()), 200,)