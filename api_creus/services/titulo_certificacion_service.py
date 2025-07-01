from models.titulo_certificacion_model import TituloCertificacion
from models.propuesta_educativa_model import PropuestaEducativa
from models import db
from utils.response_utils import make_response, ResponseStatus
from utils.validation_utils import validar_duplicado
from models.propuesta_educativa_model import PropuestaEducativa
from utils.validation_utils import validar_relacion_activa

class TituloCertificacionService:

    @staticmethod
    def get_all():
        items = TituloCertificacion.query.all()
        return (make_response(
            ResponseStatus.SUCCESS,
            "Lista de títulos-certificación" if items else "No hay títulos o certificaciones disponibles",
            [i.to_dict() for i in items]
        ), 200,)

    @staticmethod
    def get_by_id(id):
        item = TituloCertificacion.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Título-Certificación no encontrado", {"id": id}), 404,)
        return (make_response(ResponseStatus.SUCCESS, "Título-Certificación encontrado", item.to_dict()), 200,)

    @staticmethod
    def create(data):
        nombre_formateado = data['nombre'].strip().title()
        error_dup = validar_duplicado(TituloCertificacion, TituloCertificacion.nombre, nombre_formateado)
        if error_dup:
            return (make_response(ResponseStatus.FAIL, "Ya existe un título-certificación con ese nombre", {"nombre": error_dup}), 400,)

        try:
            nuevo = TituloCertificacion(
                nombre=nombre_formateado,
                observaciones=data.get('observaciones')
            )
            db.session.add(nuevo)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Título-Certificación creado correctamente", {"id": nuevo.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear título-certificación", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        item = TituloCertificacion.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Título-Certificación no encontrado", {"id": id}), 404,)

        nombre_formateado = data['nombre'].strip().title()
        error_dup = validar_duplicado(TituloCertificacion, TituloCertificacion.nombre, nombre_formateado, id_actual=id)
        if error_dup:
            return (make_response(ResponseStatus.FAIL, "Ya existe un título-certificación con ese nombre", {"nombre": error_dup}), 400,)

        try:
            item.nombre = nombre_formateado
            item.observaciones = data.get('observaciones', item.observaciones)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Título-Certificación actualizado correctamente", item.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar título-certificación", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        item = TituloCertificacion.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Título-Certificación no encontrado", {"id": id}), 404,)

        error_uso = validar_relacion_activa(PropuestaEducativa, PropuestaEducativa.id_titulo_certificacion, id, "No se puede eliminar el título-certificación porque está asociado a una propuesta educativa")
        if error_uso:
            return (make_response(ResponseStatus.FAIL, error_uso), 400,)

        try:
            db.session.delete(item)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Título-Certificación eliminado correctamente", {"id": id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al eliminar título-certificación", {"error": str(e)}), 500,)

