from models.historial_model import Historial
from models import db

class HistorialService:
    @staticmethod
    def get_all():
        return Historial.query.order_by(Historial.fecha_hora.desc()).all()
    
    @staticmethod
    def get_by_id(id):
        return Historial.query.get(id)
    
    @staticmethod
    def get_by_usuario(id_usuario):
        return Historial.query.filter.by(id_usuario = id_usuario).order_by(Historial.fecha_hora.desc()).all()
    
    @staticmethod
    def get_by_tabla(nombre_tabla):
        return Historial.query.filter_by(nombre_tabla = nombre_tabla).order_by(Historial.fecha_hora.desc()).all()