from models import db
from cms.models.preguntas_frecuentes_model import PreguntaFrecuente

from utils.response_utils import make_response, ResponseStatus


class PreguntaFrecuenteService:

    @staticmethod
    def get_all():
        preguntas = PreguntaFrecuente.query.all()
        return (make_response(ResponseStatus.SUCCESS, "Preguntas obtenidas", [p.to_dict() for p in preguntas]), 200,)

    @staticmethod
    def get_by_categoria(id_categoria):
        preguntas = PreguntaFrecuente.query.filter_by(
            id_categoria=id_categoria).all()
        return (make_response(ResponseStatus.SUCCESS, "Preguntas por categoría", [p.to_dict() for p in preguntas]), 200,)

    @staticmethod
    def create(data):
        try:
            nueva = PreguntaFrecuente(
                pregunta=data["pregunta"],
                respuesta=data["respuesta"],
                id_categoria=data["id_categoria"],
                posicion=data.get("posicion")
            )
            db.session.add(nueva)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Pregunta creada", nueva.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        pregunta = PreguntaFrecuente.query.get(id)
        if not pregunta:
            return (make_response(ResponseStatus.FAIL, "Pregunta no encontrada"), 404,)

        try:
            pregunta.pregunta = data.get("pregunta", pregunta.pregunta)
            pregunta.respuesta = data.get("respuesta", pregunta.respuesta)
            pregunta.id_categoria = data.get(
                "id_categoria", pregunta.id_categoria)
            pregunta.posicion = data.get("posicion", pregunta.posicion)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Pregunta actualizada", pregunta.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        pregunta = PreguntaFrecuente.query.get(id)
        if not pregunta:
            return (make_response(ResponseStatus.FAIL, "Pregunta no encontrada"), 404,)

        try:
            db.session.delete(pregunta)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Pregunta eliminada correctamente"), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al eliminar", {"error": str(e)}), 500,)
