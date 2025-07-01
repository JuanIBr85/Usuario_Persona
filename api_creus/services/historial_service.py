from models.historial_model import Historial
from models import db
from utils.response_utils import make_response, ResponseStatus

class HistorialService:
    @staticmethod
    def get_all():
        items = Historial.query.all()
        return (make_response(ResponseStatus.SUCCESS, "Historial obtenido con éxito.", [i.to_dict() for i in items]), 200,)
    
    @staticmethod
    def get_by_id(id):
        item = Historial.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Historial no encontrado.", {"id": id}), 404,)
        return (make_response(ResponseStatus.SUCCESS, "Historial encontrado.", item.to_dict()), 200,)
    
    @staticmethod
    def get_by_usuario(id_usuario):
        items = Historial.query.filter_by(id_usuario = id_usuario).order_by(Historial.fecha_hora.desc()).all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS , f"El usuario {id_usuario} no tiene historial.", []), 404,)
        return (make_response(ResponseStatus.SUCCESS, f"Historial del usuario {id_usuario} obtenido.", [i.to_dict() for i in items]), 200,)
    
    @staticmethod
    def get_by_tabla(nombre_tabla):
        items = Historial.query.filter_by(nombre_tabla = nombre_tabla).order_by(Historial.fecha_hora.desc()).all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, f"No se encontraron registros para la tabla '{nombre_tabla}'.", []), 404,)
        return (make_response(ResponseStatus.SUCCESS, f"Historial de la tabla '{nombre_tabla}' obtenido.", [i.to_dict() for i in items]), 200,)
    
    @staticmethod
    def get_by_tabla_registro(nombre_tabla, id_registro):
        items = Historial.query.filter_by(nombre_tabla = nombre_tabla, id_registro = id_registro).order_by(Historial.fecha_hora.desc()).all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, f"No se encontraron registros para la tabla '{nombre_tabla}' y el registro {id_registro}.", []), 404,)
        return (make_response(ResponseStatus.SUCCESS, f"Historial de la tabla '{nombre_tabla}' y el registro {id_registro} obtenido.", [i.to_dict() for i in items]), 200,)