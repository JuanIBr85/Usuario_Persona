from models.tipo_propuesta_model import TipoPropuesta
from models import db
from utils.response_utils import success_list, success_object, success_created, success_empty, error_response
from utils.validation_utils import validar_duplicado

class TipoPropuestaService:

    @staticmethod
    def get_all():
        items = TipoPropuesta.query.all()
        if not items:
            return success_empty("No hay tipos de propuesta disponibles")
        return success_list([i.to_dict() for i in items], "Lista de tipos de propuesta")

    @staticmethod
    def get_by_id(id):
        item = TipoPropuesta.query.get(id)
        if not item:
            return error_response("Tipo de propuesta no encontrado", {"id": id})
        return success_object(item.to_dict(), "Tipo de propuesta encontrado")

    @staticmethod
    def create(data):
        error_dup = validar_duplicado(TipoPropuesta, TipoPropuesta.nombre, data['nombre'].strip().title())
        if error_dup:
            return error_response("Duplicado", {"nombre": error_dup})

        try:
            nuevo = TipoPropuesta(
                nombre=data.get('nombre', '').title(),
                observaciones=data.get('observaciones')
            )
            db.session.add(nuevo)
            db.session.commit()
            return success_created(nuevo.id, "Tipo de propuesta creado")
        except Exception as e:
            return error_response("Error al crear tipo de propuesta", {"error": str(e)})

    @staticmethod
    def update(id, data):
        item = TipoPropuesta.query.get(id)
        if not item:
            return error_response("No encontrado", {"id": id})

        error_dup = validar_duplicado(TipoPropuesta, TipoPropuesta.nombre, data['nombre'].strip().title(), id_actual=id)
        if error_dup:
            return error_response("Duplicado", {"nombre": error_dup})

        try:
            item.nombre = data.get('nombre', item.nombre).title()
            item.observaciones = data.get('observaciones', item.observaciones)
            db.session.commit()
            return success_object(item.to_dict(), "Actualizado correctamente")
        except Exception as e:
            return error_response("Error al actualizar", {"error": str(e)})

    @staticmethod
    def delete(id):
        item = TipoPropuesta.query.get(id)
        if not item:
            return error_response("No encontrado", {"id": id})
        try:
            db.session.delete(item)
            db.session.commit()
            return success_object({"id": id}, "Eliminado correctamente")
        except Exception as e:
            return error_response("Error al eliminar", {"error": str(e)})
