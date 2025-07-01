from models.preinscripcion_model import Preinscripcion
from models import db
from datetime import datetime
from utils.response_utils import (make_response, ResponseStatus)
from models.cohorte_model import Cohorte
class PreinscripcionService:
    @staticmethod
    #Traer todas las preinscripciones
    def get_all():
        preinscripciones = Preinscripcion.query.all()

        if not preinscripciones:
            return (make_response(ResponseStatus.SUCCESS, "No hay preinscripciones", data = []), 204,)
        
        data = [p.to_dict() for p in preinscripciones]
        return (make_response(ResponseStatus.SUCCESS, data, "Lista de preinscripciones obtenida."), 200,)
    
    @staticmethod
    def get_by_id(id):
        preinscripcion = Preinscripcion.query.get(id)

        if not preinscripcion:
            return (make_response(ResponseStatus.FAIL, f"No se encontró la preinscripcion con ID: {id}",{"id":id}), 404,)
        
        return (make_response(ResponseStatus.SUCCESS, "Preinscripcion encontrada.", preinscripcion.to_dict()), 200,)


    @staticmethod
    def get_by_usuario(id_usuario):
        #Obtener por usuario
        preinscripciones = Preinscripcion.query.filter_by(id_usuario = id_usuario).all()
        if not preinscripciones:
            return (make_response(ResponseStatus.ERROR, "No se encontraron preinscripciones vinculadas con ese usuario.", {"id_usuario": id_usuario}), 404,)
        
        data = [p.to_dict() for p in preinscripciones]
        return (make_response (ResponseStatus.SUCCESS, data, f"Lista de preinscripciones por usuario con ID: {id_usuario}"), 200,)
    
    @staticmethod
    def get_by_cohorte(id_cohorte):
        #Obtener por cohorte
        preinscripciones = Preinscripcion.query.filter_by(id_cohorte = id_cohorte).all()
        if not preinscripciones:
            return (make_response(ResponseStatus.ERROR, "No se encontrar preinscripciones", {"id_cohorte": f"No hay registros para el ID {id_cohorte}"}), 404,)
        
        data = [p.to_dict() for p in preinscripciones]

        return (make_response(ResponseStatus.SUCCESS, data, f"Lista de preinscripciones por cohorte con ID: {id_cohorte}"), 200,)

    @staticmethod
    def create (data):            
        try:
            id_cohorte = data.get('id_cohorte')

            #Obtiene la cohorte

            cohorte = Cohorte.query.get(id_cohorte)

            if not cohorte:
                return (make_response(ResponseStatus.ERROR, "Cohorte no encontrada", {"id_cohorte": id_cohorte}), 404,)
            
            # Verificar cupos disponibles
            if cohorte.cupos_ocupados >= cohorte.cupos_maximos:
                return (make_response(ResponseStatus.ERROR, "No hay cupos disponibles para esta cohorte.", {"cupos_ocupados": cohorte.cupos_ocupados, "cupos_maximos": cohorte.cupos_maximos}
            ), 400,)
                # Convertir string ISO a datetime si es necesario
            fecha_raw = data.get('fecha_hora_preinscripcion')
            if isinstance(fecha_raw, str):
                fecha = datetime.fromisoformat(fecha_raw)
            else:
                fecha = fecha_raw

            # Valida si hay un mismo usuario preinscripto en la misma cohorte
            ya_existe = Preinscripcion.query.filter(
                Preinscripcion.id_usuario == data.get('id_usuario'),
                Preinscripcion.id_cohorte == id_cohorte,
                Preinscripcion.id_estado != 2  # Excluir preinscripciones con estado 2 (rechazada)
            ).first()
            if ya_existe:
                return (make_response(ResponseStatus.FAIL, "Datos inválidos", {
                    "id_usuario": "Este usuario ya está preinscripto en esta cohorte."
                }), 400,)
            

            # Validar si está dentro del rango de fechas permitido
            if not (cohorte.fecha_inicio_preinscripcion <= fecha <= cohorte.fecha_cierre_preinscripcion):
                return (make_response(ResponseStatus.ERROR, "La fecha de preinscripción está fuera del rango permitido.", {
                    "fecha_hora_preinscripcion": fecha.isoformat(),
                    "fecha_inicio_preinscripcion": cohorte.fecha_inicio_preinscripcion.isoformat(),
                    "fecha_fin_preinscripcion": cohorte.fecha_cierre_preinscripcion.isoformat()
                }), 400,)

            nueva_preinscripcion = Preinscripcion(
                id_usuario = data.get('id_usuario'),
                id_cohorte = id_cohorte,
                fecha_hora_preinscripcion = fecha,
                id_estado = 3,
                observaciones = data.get('observaciones', '').strip() or None
            )

            #Agregar un cupo ocupado cuando se crea una preinscripción
            cohorte.cupos_ocupados += 1

            db.session.add(nueva_preinscripcion)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Preinscripción creada correctamente.", {"id": nueva_preinscripcion.id}), 200,)
        
        except Exception as e:
            return (make_response(ResponseStatus.ERROR, "Error al crear la preinscripción", {"error": str(e)}), 500)
        
    @staticmethod
    def update(id, data):
        preinscripcion = Preinscripcion.query.get(id)
        if not preinscripcion:
            return (make_response(ResponseStatus.FAIL, "No se encontró la preinscripción", {"id": id}), 404,)

        try:
            nuevo_estado = data.get('id_estado', preinscripcion.id_estado)
            nuevo_id_usuario = data.get('id_usuario', preinscripcion.id_usuario)
            nuevo_id_cohorte = data.get('id_cohorte', preinscripcion.id_cohorte)

            if preinscripcion.id_estado == 2 and nuevo_estado != 2:
                ya_existe = Preinscripcion.query.filter(
                    Preinscripcion.id_usuario == nuevo_id_usuario,
                    Preinscripcion.id_cohorte == nuevo_id_cohorte,
                    Preinscripcion.id != preinscripcion.id,
                    Preinscripcion.id_estado != 2
                ).first()
                if ya_existe:
                    return (make_response(ResponseStatus.FAIL, "Datos inválidos", {
                        "id_usuario": "Este usuario ya está preinscripto en esta cohorte."
                    }), 400,)

            cohorte_nueva = Cohorte.query.get(nuevo_id_cohorte)
            if not cohorte_nueva:
                return (make_response(ResponseStatus.ERROR, "Cohorte no encontrada", {"id_cohorte": nuevo_id_cohorte}), 404,)

            cohorte_anterior = Cohorte.query.get(preinscripcion.id_cohorte)
            cambio_de_cohorte = nuevo_id_cohorte != preinscripcion.id_cohorte
            estado_actual_ocupa_cupo = preinscripcion.id_estado in [1, 3]
            estado_nuevo_ocupa_cupo = nuevo_estado in [1, 3]

            # si pasa de un estado que no ocupaba cupo a uno que si
            if estado_nuevo_ocupa_cupo and not estado_actual_ocupa_cupo:
                if cohorte_nueva.cupos_ocupados >= cohorte_nueva.cupos_maximos:
                    return (make_response(ResponseStatus.FAIL, "No hay cupos disponibles para esta cohorte.", {
                        "cupos_ocupados": cohorte_nueva.cupos_ocupados,
                        "cupos_maximos": cohorte_nueva.cupos_maximos
                    }), 400,)
                cohorte_nueva.cupos_ocupados += 1

            # si deja de ocupar cupo, o cambia de cohorte
            if estado_actual_ocupa_cupo and (not estado_nuevo_ocupa_cupo or cambio_de_cohorte):
                if cohorte_anterior and cohorte_anterior.cupos_ocupados > 0:
                    cohorte_anterior.cupos_ocupados -= 1

                # Si también pasa a ocupar cupo en otra cohorte
                if cambio_de_cohorte and estado_nuevo_ocupa_cupo:
                    if cohorte_nueva.cupos_ocupados >= cohorte_nueva.cupos_maximos:
                        return (make_response(ResponseStatus.FAIL, "No hay cupos disponibles en la nueva cohorte.", {
                            "cupos_ocupados": cohorte_nueva.cupos_ocupados,
                            "cupos_maximos": cohorte_nueva.cupos_maximos
                        }), 400,)
                    cohorte_nueva.cupos_ocupados += 1

            # Actualizar campos
            preinscripcion.id_usuario = nuevo_id_usuario
            preinscripcion.id_cohorte = nuevo_id_cohorte
            preinscripcion.fecha_hora_preinscripcion = data.get(
                'fecha_hora_preinscripcion',
                preinscripcion.fecha_hora_preinscripcion
            )
            preinscripcion.id_estado = nuevo_estado
            preinscripcion.observaciones = data.get(
                'observaciones',
                preinscripcion.observaciones
            )

            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Preinscripción actualizada correctamente.", {"id": preinscripcion.id}), 200,)

        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar la preinscripción", {"error": str(e)}), 500,)
    
    @staticmethod
    def delete (id):
        preinscripcion = Preinscripcion.query.get(id)
        if not preinscripcion:
            return (make_response(ResponseStatus.FAIL, "No se encontro la preinscripción", {"id":id}), 404,)
        
        try:
            #Verificar si la preinscripción esta activa o pendiente y restar el cupo de la cohorte.
            if preinscripcion.id_estado in [1, 3]:
                cohorte = Cohorte.query.get(preinscripcion.id_cohorte)
                if cohorte and cohorte.cupos_ocupados > 0:
                    cohorte.cupos_ocupados -= 1

            db.session.delete(preinscripcion)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Preinscripción eliminada correctamente.", {"id": preinscripcion.id}), 200,)

        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al eliminar la preinscripción", {"error": str(e)}), 500,)