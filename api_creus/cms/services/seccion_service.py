from models import db
from cms.models.seccion_model import Seccion
from utils.response_utils import make_response, ResponseStatus


class SeccionService:

    @staticmethod
    def get_all_visibles():
        secciones = Seccion.query.filter_by(visible=True).all()
        return (make_response(ResponseStatus.SUCCESS, "Secciones visibles obtenidas", [s.to_dict() for s in secciones]), 200,)

    @staticmethod
    def get_all():
        secciones = Seccion.query.all()
        return (make_response(ResponseStatus.SUCCESS, "Todas las secciones", [s.to_dict() for s in secciones]), 200,)

    @staticmethod
    def create(data):
        try:
            nueva = Seccion(
                nombre=data["nombre"],
                descripcion=data.get("descripcion"),
                visible=data["visible"]
            )
            db.session.add(nueva)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Sección creada", nueva.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear sección", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        seccion = Seccion.query.get(id)
        if not seccion:
            return (make_response(ResponseStatus.FAIL, "Sección no encontrada"), 404,)

        try:
            seccion.nombre = data.get("nombre", seccion.nombre)
            seccion.descripcion = data.get("descripcion", seccion.descripcion)
            seccion.visible = data.get("visible", seccion.visible)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Sección actualizada", seccion.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar sección", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        seccion = Seccion.query.get(id)
        if not seccion:
            return (make_response(ResponseStatus.FAIL, "Sección no encontrada"), 404,)

        try:
            db.session.delete(seccion)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Sección y bloques eliminados correctamente"), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al eliminar sección", {"error": str(e)}), 500,)
