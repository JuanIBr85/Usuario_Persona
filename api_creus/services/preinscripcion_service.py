from models.preinscripcion_model import Preinscripcion
from models import db
from datetime import datetime
from utils.response_utils import (make_response, ResponseStatus)
class PreinscripcionService:
    @staticmethod
    #Traer todas las preinscripciones
    def get_all():
        preinscripciones = Preinscripcion.query.all()

        if not preinscripciones:
            return make_response(ResponseStatus.SUCCESS, "No hay preinscripciones", data = [])
        
        data = [p.to_dict() for p in preinscripciones]
        return make_response(ResponseStatus.SUCCESS, data, "Lista de preinscripciones obtenida.")
    
    @staticmethod
    def get_by_id(id):
        preinscripcion = Preinscripcion.query.get(id)

        if not preinscripcion:
            return make_response(ResponseStatus.FAIL, f"No se encontró la preinscripcion con ID: {id}",{"id":id})
        
        return make_response(ResponseStatus.SUCCESS, "Preinscripcion encontrada.", preinscripcion.to_dict())


    @staticmethod
    def get_by_usuario(id_usuario):
        #Obtener por usuario
        preinscripciones = Preinscripcion.query.filter_by(id_usuario = id_usuario).all()
        if not preinscripciones:
            return make_response(ResponseStatus.ERROR, "No se encontraron preinscripciones vinculadas con ese usuario.", {"id_usuario": id_usuario})
        
        data = [p.to_dict() for p in preinscripciones]
        return make_response (ResponseStatus.SUCCESS, data, f"Lista de preinscripciones por usuario con ID: {id_usuario}")
    
    @staticmethod
    def get_by_cohorte(id_cohorte):
        #Obtener por cohorte
        preinscripciones = Preinscripcion.query.filter_by(id_cohorte = id_cohorte).all()
        if not preinscripciones:
            return make_response(ResponseStatus.ERROR, "No se encontrar preinscripciones", {"id_cohorte": f"No hay registros para el ID {id_cohorte}"})
        
        data = [p.to_dict() for p in preinscripciones]

        return make_response(ResponseStatus.SUCCESS, data, f"Lista de preinscripciones por cohorte con ID: {id_cohorte}")

    @staticmethod
    def create (data):            
        try:
                # Convertir string ISO a datetime si es necesario
            fecha_raw = data.get('fecha_hora_preinscripcion')
            if isinstance(fecha_raw, str):
                fecha = datetime.fromisoformat(fecha_raw)
            else:
                fecha = fecha_raw

            nueva_preinscripcion = Preinscripcion(
                id_usuario = data.get('id_usuario'),
                id_cohorte = data.get('id_cohorte'),
                fecha_hora_preinscripcion = fecha,
                id_estado = data.get('id_estado'),
                observaciones = data.get('observaciones', '').strip() or None
            )
            db.session.add(nueva_preinscripcion)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Preinscripción creada correctamente.", {"id": nueva_preinscripcion.id})
        
        except Exception as e:
            return make_response(ResponseStatus.ERROR, "Error al crear la preinscripción", {"error": str(e)})
        
    @staticmethod
    def update (id, data):
        preinscripcion = Preinscripcion.query.get(id)
        if not preinscripcion:
            return make_response (ResponseStatus.FAIL, "No se encontro la preinscripción", {"id":id})
        
        try:
            preinscripcion.id_usuario = data.get('id_usuario', preinscripcion.id_usuario)
            preinscripcion.id_cohorte = data.get('id_cohorte', preinscripcion.id_cohorte)
            preinscripcion.fecha_hora_preinscripcion = data.get('fecha_hora_preinscripcion', preinscripcion.fecha_hora_preinscripcion)
            preinscripcion.id_estado = data.get('id_estado', preinscripcion.id_estado)
            preinscripcion.observaciones = data.get('observaciones', preinscripcion.observaciones)

            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Preinscripcion actualizada correctamente.", {"id": preinscripcion.id})
        
        except Exception as e:
            return make_response (ResponseStatus.ERROR, "Error al actualizar la preinscripción", {"error": str(e)})
        
        
    
    @staticmethod
    def delete (id):
        preinscripcion = Preinscripcion.query.get(id)
        if not preinscripcion:
            return make_response(ResponseStatus.FAIL, "No se encontro la preinscripción", {"id":id})
        
        if preinscripcion.id_estado == 2:
            return make_response(ResponseStatus.FAIL, "La preinscripción ya esta inactiva", {"estado": "Inactiva"})

        try:
            preinscripcion.id_estado = 2 #borrado logico(segun el id de la base de datos)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Preinscripcion ocultada correctamente.", {"id": preinscripcion.id})
        
        except Exception as e:
            return make_response (ResponseStatus.ERROR, "Error al ocultar la preinscripción", {"error": str(e)})