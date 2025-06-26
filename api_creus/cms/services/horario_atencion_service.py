from models import db
from cms.models.horario_atencion_model import HorarioAtencion
from utils.response_utils import make_response, ResponseStatus
from datetime import datetime

class HorarioAtencionService:

    @staticmethod
    def get_all_visibles():
        horarios = HorarioAtencion.query.filter_by(visible=True).all()
        if not horarios:
            return make_response(ResponseStatus.SUCCESS, "No hay horarios visibles")
        return make_response(ResponseStatus.SUCCESS, "Datos de horario obtenidos correctamente", [h.to_dict() for h in horarios])

    @staticmethod
    def get_all():
        horarios = HorarioAtencion.query.all()
        if not horarios:
            return make_response(ResponseStatus.SUCCESS, "No hay horarios registrados")
        return make_response(ResponseStatus.SUCCESS, "Todos los horarios obtenidos correctamente", [h.to_dict() for h in horarios])
    
    @staticmethod
    def create_horario(data):
        try:
            nuevo_horario = HorarioAtencion(
                dia=data["dia"],
                hora_inicio=datetime.strptime(data["hora_inicio"], "%H:%M").time(),
                hora_cierre=datetime.strptime(data["hora_cierre"], "%H:%M").time(),
                visible=data.get("visible", True)
            )

            db.session.add(nuevo_horario)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Horario creado correctamente", nuevo_horario.to_dict())

        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear el horario", {"error": str(e)})

    @staticmethod
    def update_horario(id, data):
        horario = HorarioAtencion.query.get(id)
        if not horario:
            return make_response(ResponseStatus.FAIL, "Horario no encontrado", {"detalle": f"El horario con ID {id} no existe "})

        try:
            horario.dia = data.get("dia", horario.dia)
            horario.hora_inicio = datetime.strptime(data["hora_inicio"], "%H:%M").time()
            horario.hora_cierre = datetime.strptime(data["hora_cierre"], "%H:%M").time()
            horario.visible = data.get("visible", horario.visible)

            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Horario actualizado correctamente", horario.to_dict())

        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar el horario", {"error": str(e)})

    @staticmethod
    def delete_horario(id):
        horario = HorarioAtencion.query.get(id)
        if not horario:
            return make_response(ResponseStatus.FAIL, "Horario no encontrado", {"detalle": f"El horario con ID {id} no existe "})

        if not horario.visible:
            return make_response(ResponseStatus.FAIL, "El horario ya fue eliminado", {"detalle": f"El horario con ID {id} ya está marcado como no visible"})

        try:
            horario.visible = False
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Horario marcado como no visible", {"id": id})

        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar el horario", {"error": str(e)})