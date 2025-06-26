from models.area_conocimiento_model import AreaConocimiento
from models import db
from utils.validation_utils import validar_duplicado
from utils.response_utils import make_response, ResponseStatus
from models.propuesta_educativa_model import PropuestaEducativa
from utils.validation_utils import validar_relacion_activa

class AreaConocimientoService:

    @staticmethod
    def get_all():
        items = AreaConocimiento.query.all()
        if not items:
            return make_response(ResponseStatus.SUCCESS, "No hay áreas de conocimiento disponibles", data=[])
        return make_response(ResponseStatus.SUCCESS, "Lista de áreas de conocimiento", [i.to_dict() for i in items])

    @staticmethod
    def get_by_id(id):
        item = AreaConocimiento.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Área de conocimiento no encontrada", {"id": id})
        return make_response(ResponseStatus.SUCCESS, "Área de conocimiento encontrada", item.to_dict())

    @staticmethod
    def create(data):
        nombre_formateado = data['nombre'].strip().title()

        error_dup = validar_duplicado(AreaConocimiento, AreaConocimiento.nombre, nombre_formateado)
        if error_dup:
            return make_response(ResponseStatus.FAIL, "Ya hay un área de conocimiento con ese nombre", {"nombre": error_dup})

        try:
            nuevo = AreaConocimiento(
                nombre=nombre_formateado,
                observaciones=data.get('observaciones')
            )
            db.session.add(nuevo)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Área de conocimiento creada correctamente", {"id": nuevo.id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear área de conocimiento", {"error": str(e)})

    @staticmethod
    def update(id, data):
        item = AreaConocimiento.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Área de conocimiento no encontrada", {"id": id})

        nombre_formateado = data['nombre'].strip().title()
        error_dup = validar_duplicado(AreaConocimiento, AreaConocimiento.nombre, nombre_formateado, id_actual=id)
        if error_dup:
            return make_response(ResponseStatus.FAIL, "Ya hay un área de conocimiento con ese nombre", {"nombre": error_dup})

        try:
            item.nombre = nombre_formateado
            item.observaciones = data.get('observaciones', item.observaciones)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Área de conocimiento actualizada correctamente", item.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar área de conocimiento", {"error": str(e)})

    @staticmethod
    def delete(id):
        item = AreaConocimiento.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Área de conocimiento no encontrada", {"id": id})

        error_uso = validar_relacion_activa(PropuestaEducativa, PropuestaEducativa.id_area_conocimiento,id, "No se puede eliminar el área de conocimiento porque está asociada a una propuesta educativa")
        if error_uso:
            return make_response(ResponseStatus.FAIL, error_uso)

        try:
            db.session.delete(item)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Área de conocimiento eliminada correctamente", {"id": id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar área de conocimiento", {"error": str(e)})

