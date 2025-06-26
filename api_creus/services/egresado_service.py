from models.egresado_model import Egresado
from models import db
from datetime import datetime
from utils.response_utils import (make_response, ResponseStatus)

class EgresadoService:
    @staticmethod
    def get_all():
        #Traer todos los egresados
        egresados = Egresado.query.all()

        if not egresados:
            return make_response(ResponseStatus.SUCCESS,"No hay egresados", data=[])
        
        data = [e.to_dict() for e in egresados]
        return make_response (ResponseStatus.SUCCESS, data, "Lista de egresados obtenida con exito.")
    
    @staticmethod
    def get_by_id(id):
        #obtener egresado por id
        egresado = Egresado.query.get(id)
        if not egresado:
            return make_response(ResponseStatus.FAIL, f"No se encontró el egresado con ID: {id}", {"id": id})
            
        return make_response(ResponseStatus.SUCCESS, "Egresado encontrado.", data = egresado.to_dict())
    
    @staticmethod
    def get_by_cohorte(id_cohorte):
        #Obtener egresado por la cohorte
        egresados = Egresado.query.filter_by(id_cohorte = id_cohorte).all()
        if not egresados:
            return make_response(ResponseStatus.SUCCESS, "No se encontraron egresados para esa cohorte.", data = [])
        
        data = [e.to_dict() for e in egresados]
        return make_response (ResponseStatus.SUCCESS, data, f"Lista de egresados por cohorte con ID: {id_cohorte}")
    
    @staticmethod
    def create(data):
        #crear un egresado
        try:
            nuevo_egresado = Egresado(
                id_persona = data.get('id_persona'),
                fecha_egreso = data.get('fecha_egreso'),
                id_cohorte = data.get('id_cohorte'),
                testimonio = data.get('testimonio'),
                id_estado = data.get('id_estado'),
                observaciones = data.get('observaciones')
            )
            db.session.add(nuevo_egresado)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Egresado creado correctamente.", {"id": nuevo_egresado.id,} )
        
        except Exception as e:
            return make_response(ResponseStatus.ERROR, "Error al crear el egresado", {"error": str(e)})
        
    @staticmethod
    def update (id,data):
        egresado = Egresado.query.get(id)

        if not egresado:
            return make_response(ResponseStatus.FAIL, "No se encontro el egresado", {"id": id})
        
        try:
            egresado.id_persona = data.get('id_persona', egresado.id_persona)
            egresado.fecha_egreso = data.get('fecha_egreso', egresado.fecha_egreso)
            egresado.id_cohorte = data.get('id_cohorte', egresado.id_cohorte)
            egresado.testimonio = data.get('testimonio', egresado.testimonio)
            egresado.id_estado = data.get('id_estado', egresado.id_estado)
            egresado.observaciones = data.get('observaciones', egresado.observaciones)
        
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Egresado actualizado correctamente", {"id": egresado.id} )
        
        except Exception as e:
            return make_response(ResponseStatus.ERROR, "Error al actualizar al egresado", {"error": str(e)})
        

    @staticmethod
    def delete (id):
        egresado = Egresado.query.get(id)
        if not egresado:
            return make_response(ResponseStatus.FAIL, "No se encontró el egresado", {"id": id})
        
        if egresado.id_estado == 2:
            return make_response(ResponseStatus.FAIL, "El egresado ya esta inactivo", {"estado": "Inactiva"})
        
        try:
            egresado.id_estado = 2 #borrado logico (id_estado 2 es inactivo)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "El egresado fue ocultado correctamente", {"id": egresado.id})
        except Exception as e:
            return make_response(ResponseStatus.ERROR, "Error al ocultar al egresado",{"error":str(e)})