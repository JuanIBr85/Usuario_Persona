from models.area_conocimiento_model import AreaConocimiento
from models import db
from utils.validation_utils import validar_duplicado
from utils.response_utils import make_response, ResponseStatus

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
            return make_response(ResponseStatus.FAIL, "Duplicado", {"nombre": error_dup})

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
            return make_response(ResponseStatus.FAIL, "Duplicado", {"nombre": error_dup})

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
        try:
            db.session.delete(item)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Área de conocimiento eliminada correctamente", {"id": id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar área de conocimiento", {"error": str(e)})


'''from models.area_conocimiento_model import AreaConocimiento
from models import db
from utils.response_utils import success_list, success_object, success_created, success_empty, error_response
from utils.validation_utils import validar_duplicado

class AreaConocimientoService:

    @staticmethod
    def get_all():
        items = AreaConocimiento.query.all()
        if not items:
            return success_empty("No hay áreas de conocimiento disponibles")
        return success_list([i.to_dict() for i in items], "Lista de áreas de conocimiento")

    @staticmethod
    def get_by_id(id):
        item = AreaConocimiento.query.get(id)
        if not item:
            return error_response("Área de conocimiento no encontrada", {"id": id})
        return success_object(item.to_dict(), "Área de conocimiento encontrada")

    @staticmethod
    def create(data):
        error_dup = validar_duplicado(AreaConocimiento, AreaConocimiento.nombre, data['nombre'].strip().title())
        if error_dup:
            return error_response("Duplicado", {"nombre": error_dup})

        try:
            nuevo = AreaConocimiento(
                nombre=data.get('nombre', '').title(),
                observaciones=data.get('observaciones')
            )
            db.session.add(nuevo)
            db.session.commit()
            return success_created(nuevo.id, "Área de conocimiento creada")
        except Exception as e:
            return error_response("Error al crear área de conocimiento", {"error": str(e)})

    @staticmethod
    def update(id, data):
        item = AreaConocimiento.query.get(id)
        if not item:
            return error_response("No encontrada", {"id": id})

        error_dup = validar_duplicado(AreaConocimiento, AreaConocimiento.nombre, data['nombre'].strip().title(), id_actual=id)
        if error_dup:
            return error_response("Duplicado", {"nombre": error_dup})

        try:
            item.nombre = data.get('nombre', item.nombre).title()
            item.observaciones = data.get('observaciones', item.observaciones)
            db.session.commit()
            return success_object(item.to_dict(), "Actualizada correctamente")
        except Exception as e:
            return error_response("Error al actualizar", {"error": str(e)})

    @staticmethod
    def delete(id):
        item = AreaConocimiento.query.get(id)
        if not item:
            return error_response("No encontrada", {"id": id})
        try:
            db.session.delete(item)
            db.session.commit()
            return success_object({"id": id}, "Eliminada correctamente")
        except Exception as e:
            return error_response("Error al eliminar", {"error": str(e)})'''

