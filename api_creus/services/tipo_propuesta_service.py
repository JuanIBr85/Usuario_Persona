from models.tipo_propuesta_model import TipoPropuesta
from models import db
from utils.response_utils import make_response, ResponseStatus
from utils.validation_utils import validar_duplicado
from models.propuesta_educativa_model import PropuestaEducativa
from utils.validation_utils import validar_relacion_activa

class TipoPropuestaService:

    @staticmethod
    def get_all():
        items = TipoPropuesta.query.all()
        return (make_response(
            ResponseStatus.SUCCESS,
            "Lista de tipos de propuesta" if items else "No hay tipos de propuesta disponibles",
            [i.to_dict() for i in items]
        ), 200,)

    @staticmethod
    def get_by_id(id):
        item = TipoPropuesta.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Tipo de propuesta no encontrado", {"id": id}), 404,)
        return (make_response(ResponseStatus.SUCCESS, "Tipo de propuesta encontrado", item.to_dict()), 200,)

    @staticmethod
    def create(data):
        nombre_formateado = data['nombre'].strip().title()
        error_dup = validar_duplicado(TipoPropuesta, TipoPropuesta.nombre, nombre_formateado)
        if error_dup:
            return (make_response(ResponseStatus.FAIL, "Ya hay un tipo de propuesta con ese nombre", {"nombre": error_dup}), 400,)

        try:
            nuevo = TipoPropuesta(
                nombre=nombre_formateado,
                observaciones=data.get('observaciones')
            )
            db.session.add(nuevo)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Tipo de propuesta creado correctamente", {"id": nuevo.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear tipo de propuesta", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        item = TipoPropuesta.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Tipo de propuesta no encontrado", {"id": id}), 404,)

        nombre_formateado = data['nombre'].strip().title()
        error_dup = validar_duplicado(TipoPropuesta, TipoPropuesta.nombre, nombre_formateado, id_actual=id)
        if error_dup:
            return (make_response(ResponseStatus.FAIL, "Ya hay un tipo de propuesta con ese nombre", {"nombre": error_dup}), 400,)

        try:
            item.nombre = nombre_formateado
            item.observaciones = data.get('observaciones', item.observaciones)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Tipo de propuesta actualizada correctamente", item.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar tipo de propuesta", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        item = TipoPropuesta.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Tipo de propuesta no encontrado", {"id": id}), 404,)

        error_uso = validar_relacion_activa(PropuestaEducativa, PropuestaEducativa.id_tipo_propuesta, id, "No se puede eliminar el tipo de propuesta porque está asociado a una propuesta educativa")
        if error_uso:
            return (make_response(ResponseStatus.FAIL, error_uso), 400,)

        try:
            db.session.delete(item)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Tipo de propuesta eliminado correctamente", {"id": id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al eliminar tipo de propuesta", {"error": str(e)}), 500,)
    
