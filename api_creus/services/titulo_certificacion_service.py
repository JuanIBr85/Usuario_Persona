from models.titulo_certificacion_model import TituloCertificacion
from models.propuesta_educativa_model import PropuestaEducativa
from models import db
from utils.response_utils import success_list, success_object, success_created, success_empty, error_response
from utils.validation_utils import validar_duplicado

class TituloCertificacionService:

    @staticmethod
    def get_all():
        items = TituloCertificacion.query.all()
        if not items:
            return success_empty("No hay títulos de certificación disponibles")
        return success_list([i.to_dict() for i in items], "Lista de títulos de certificación")

    @staticmethod
    def get_by_id(id):
        item = TituloCertificacion.query.get(id)
        if not item:
            return error_response("Título de certificación no encontrado", {"id": id})
        return success_object(item.to_dict(), "Título de certificación encontrado")

    @staticmethod
    def create(data):
        error_dup = validar_duplicado(TituloCertificacion, TituloCertificacion.nombre, data['nombre'].strip().title())
        if error_dup:
            return error_response("Duplicado", {"nombre": error_dup})

        try:
            nuevo = TituloCertificacion(
                nombre=data.get('nombre', '').title(),
                observaciones=data.get('observaciones')
            )
            db.session.add(nuevo)
            db.session.commit()
            return success_created(nuevo.id, "Título de certificación creado")
        except Exception as e:
            return error_response("Error al crear título de certificación", {"error": str(e)})

    @staticmethod
    def update(id, data):
        item = TituloCertificacion.query.get(id)
        if not item:
            return error_response("No encontrado", {"id": id})

        error_dup = validar_duplicado(TituloCertificacion, TituloCertificacion.nombre, data['nombre'].strip().title(), id_actual=id)
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
        item = TituloCertificacion.query.get(id)
        if not item:
            return error_response("No encontrado", {"id": id})

        usado = PropuestaEducativa.query.filter_by(id_titulo_certificacion=id).first()
        if usado:
            return error_response("No se puede eliminar", {
                "detalle": "Este título está asociado a una propuesta educativa"
            })

        try:
            db.session.delete(item)
            db.session.commit()
            return success_object({"id": id}, "Eliminado correctamente")
        except Exception as e:
            return error_response("Error al eliminar", {"error": str(e)})