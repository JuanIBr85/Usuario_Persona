from models import db
from cms.models.categoria_model import Categoria
from utils.response_utils import make_response, ResponseStatus

class CategoriaService:

    @staticmethod
    def get_all():
        categorias = Categoria.query.all()
        return (make_response(ResponseStatus.SUCCESS, "Categorías obtenidas", [c.to_dict() for c in categorias]), 200,)

    @staticmethod
    def create(data):
        try:
            nueva = Categoria(
                nombre=data["nombre"], observacion=data.get("observacion"))
            db.session.add(nueva)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Categoría creada", nueva.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear categoría", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        categoria = Categoria.query.get(id)
        if not categoria:
            return (make_response(ResponseStatus.FAIL, "Categoría no encontrada"), 404,)

        try:
            categoria.nombre = data.get("nombre", categoria.nombre)
            categoria.observacion = data.get(
                "observacion", categoria.observacion)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Categoría actualizada", categoria.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        categoria = Categoria.query.get(id)
        if not categoria:
            return (make_response(ResponseStatus.FAIL, "Categoría no encontrada"), 404,)

        try:
            db.session.delete(categoria)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Categoría y sus preguntas eliminadas"), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al eliminar", {"error": str(e)}), 500,)
