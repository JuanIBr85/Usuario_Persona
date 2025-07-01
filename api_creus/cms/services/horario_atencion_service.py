from models import db
from cms.models.horario_atencion_model import HorarioAtencion
from utils.response_utils import make_response, ResponseStatus
from datetime import datetime

class HorarioAtencionService:

    @staticmethod #obtener todos los horarios visibles ordenados por posicion
    def get_all_visibles():
        horarios = HorarioAtencion.query.filter_by(visible=True).order_by(HorarioAtencion.posicion).all()
        if not horarios:
            return (make_response(ResponseStatus.SUCCESS, "No hay horarios visibles"), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Datos de horario obtenidos correctamente", [h.to_dict() for h in horarios]), 200,)

    @staticmethod #obtener todos los horarios (visibles y ocultos) ordenados por posicion
    def get_all():
        horarios = HorarioAtencion.query.order_by(HorarioAtencion.posicion).all()
        if not horarios:
            return (make_response(ResponseStatus.SUCCESS, "No hay horarios registrados"), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Todos los horarios obtenidos correctamente", [h.to_dict() for h in horarios]), 200,)
    
    @staticmethod #crear horario
    def create_horario(data):
        try:
            # Obtener la siguiente posición disponible
            max_posicion = db.session.query(db.func.max(HorarioAtencion.posicion)).scalar() or 0
            nueva_posicion = max_posicion + 1
            
            nuevo_horario = HorarioAtencion(
                dia=data["dia"],
                hora_inicio=datetime.strptime(data["hora_inicio"], "%H:%M").time(),
                hora_cierre=datetime.strptime(data["hora_cierre"], "%H:%M").time(),
                visible=data.get("visible", True),
                posicion=data.get("posicion", nueva_posicion)
            )

            db.session.add(nuevo_horario)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Horario creado correctamente", nuevo_horario.to_dict()), 200,)

        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear el horario", {"error": str(e)}), 500,)

    @staticmethod #modificar horario
    def update_horario(id, data):
        horario = HorarioAtencion.query.get(id)
        if not horario:
            return (make_response(ResponseStatus.FAIL, "Horario no encontrado", {"detalle": f"El horario con ID {id} no existe "}), 404,)

        try:
            horario.dia = data.get("dia", horario.dia)
            horario.hora_inicio = datetime.strptime(data["hora_inicio"], "%H:%M").time()
            horario.hora_cierre = datetime.strptime(data["hora_cierre"], "%H:%M").time()
            horario.visible = data.get("visible", horario.visible)
            horario.posicion = data.get("posicion", horario.posicion)

            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Horario actualizado correctamente", horario.to_dict()), 200,)

        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar el horario", {"error": str(e)}), 500,)

    @staticmethod #ocultar horario
    def delete_horario(id):
        horario = HorarioAtencion.query.get(id)
        if not horario:
            return (make_response(ResponseStatus.FAIL, "Horario no encontrado", {"detalle": f"El horario con ID {id} no existe "}), 404,)

        if not horario.visible:
            return (make_response(ResponseStatus.FAIL, "El horario ya fue eliminado", {"detalle": f"El horario con ID {id} ya está marcado como no visible"}), 400,)

        try:
            horario.visible = False
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Horario marcado como no visible", {"id": id}), 200,)

        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al eliminar el horario", {"error": str(e)}), 500,)
    
    @staticmethod #reordenar horarios
    def reorder_horarios(horarios_order):
        """
        Actualiza las posiciones de los horarios según el nuevo orden
        horarios_order: lista de diccionarios con {id, posicion}
        """
        try:
            for item in horarios_order:
                horario = HorarioAtencion.query.get(item['id'])
                if horario:
                    horario.posicion = item['posicion']
            
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Horarios reordenados correctamente"), 200,)
        
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al reordenar horarios", {"error": str(e)}), 500,)