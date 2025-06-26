from cms.models.categoria_model import Categoria
from models import db
from utils.response_utils import make_response, ResponseStatus


class CategoriaService:

    @staticmethod
    def get_all():
        categorias = Categoria.query.all()
        data = [c.to_dict() for c in categorias]
        if not data:
            return make_response(ResponseStatus.SUCCESS, "No se encontraron categorías", [])
        return make_response(ResponseStatus.SUCCESS, "Categorías obtenidas correctamente", data)

    @staticmethod
    def create(data):
        try:
            nueva = Categoria(
                nombre=data["nombre"],
                observacion=data.get("observacion")
            )
            db.session.add(nueva)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Categoría creada correctamente", nueva.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear categoría", {"detalle": str(e)})

    @staticmethod
    def update(id, data):
        categoria = Categoria.query.get(id)
        if not categoria:
            return make_response(ResponseStatus.FAIL, "Categoría no encontrada")

        try:
            categoria.nombre = data.get("nombre", categoria.nombre)
            categoria.observacion = data.get(
                "observacion", categoria.observacion)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Categoría actualizada correctamente", categoria.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar", {"detalle": str(e)})

    @staticmethod
    def delete(id):
        categoria = Categoria.query.get(id)
        if not categoria:
            return make_response(ResponseStatus.FAIL, "Categoría no encontrada")

        try:
            db.session.delete(categoria)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Categoría eliminada correctamente", {"id": id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar", {"detalle": str(e)})
