from models.modalidad_model import Modalidad
from models import db
from utils.response_utils import make_response, ResponseStatus

class ModalidadService:
    @staticmethod
    def get_all():
        #Traer todas las modalidades
        modalidades = Modalidad.query.all()

        if not modalidades:
            return (make_response(ResponseStatus.SUCCESS, "No hay modalidades", data = []), 204,)
        
        data = [m.to_dict() for m in modalidades]
        return (make_response(ResponseStatus.SUCCESS, data, "Lista de modalidades obtenida correctamente"), 200,)
    

    @staticmethod
    def get_by_id(modalidad_id):
        #Traer modalidad por ID
        modalidad = Modalidad.query.get(modalidad_id)

        if not modalidad:
            return (make_response(ResponseStatus.FAIL, f"No se encontro la modalidad con ID: {modalidad_id}", {"id":modalidad_id}), 404,)
        
        return (make_response(ResponseStatus.SUCCESS, "Modalidad encontrada.", data = modalidad.to_dict()), 200,)
