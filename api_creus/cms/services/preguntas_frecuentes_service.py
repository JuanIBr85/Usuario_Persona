from cms.models.preguntas_frecuentes_model import PreguntaFrecuente
from models import db
from utils.response_utils import make_response, ResponseStatus


class PreguntaFrecuenteService:

    @staticmethod
    def get_all():
        preguntas = PreguntaFrecuente.query.order_by(
            PreguntaFrecuente.posicion).all()
        if not preguntas:
            return make_response(ResponseStatus.SUCCESS, "No se encontraron preguntas frecuentes", [])
        return make_response(ResponseStatus.SUCCESS, "Preguntas frecuentes obtenidas", [p.to_dict() for p in preguntas])

    @staticmethod
    def get_by_categoria(id_categoria):
        preguntas = PreguntaFrecuente.query.filter_by(
            id_categoria=id_categoria).order_by(PreguntaFrecuente.posicion).all()
        if not preguntas:
            return make_response(ResponseStatus.SUCCESS, "No se encontraron preguntas para esta categoría", [])
        return make_response(ResponseStatus.SUCCESS, "Preguntas por categoría obtenidas", [p.to_dict() for p in preguntas])

    @staticmethod
    def create(data):
        try:
            nueva = PreguntaFrecuente(
                pregunta=data["pregunta"],
                respuesta=data["respuesta"],
                posicion=data["posicion"],
                id_categoria=data["id_categoria"]
            )
            db.session.add(nueva)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Pregunta creada correctamente", nueva.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear pregunta", {"detalle": str(e)})

    @staticmethod
    def update(id, data):
        pregunta = PreguntaFrecuente.query.get(id)
        if not pregunta:
            return make_response(ResponseStatus.FAIL, "Pregunta no encontrada")

        try:
            pregunta.pregunta = data.get("pregunta", pregunta.pregunta)
            pregunta.respuesta = data.get("respuesta", pregunta.respuesta)
            pregunta.posicion = data.get("posicion", pregunta.posicion)
            pregunta.id_categoria = data.get(
                "id_categoria", pregunta.id_categoria)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Pregunta actualizada", pregunta.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar", {"detalle": str(e)})

    @staticmethod
    def delete(id):
        pregunta = PreguntaFrecuente.query.get(id)
        if not pregunta:
            return make_response(ResponseStatus.FAIL, "Pregunta no encontrada")

        try:
            db.session.delete(pregunta)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Pregunta eliminada", {"id": id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar", {"detalle": str(e)})
