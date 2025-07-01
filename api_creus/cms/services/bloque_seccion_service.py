from models import db
from cms.models.bloque_seccion_model import BloqueSeccion
from utils.response_utils import make_response, ResponseStatus


class BloqueSeccionService:

    @staticmethod
    def get_all():
        bloques = BloqueSeccion.query.all()
        return (make_response(ResponseStatus.SUCCESS, "Bloques obtenidos", [b.to_dict() for b in bloques]), 200,)

    @staticmethod
    def get_by_seccion(id_seccion):
        bloques = BloqueSeccion.query.filter_by(
            id_seccion=id_seccion, visible=True).all()
        return (make_response(ResponseStatus.SUCCESS, "Bloques visibles por sección", [b.to_dict() for b in bloques]), 200,)

    @staticmethod
    def create(data):
        try:
            # Validar máximo 3 bloques visibles por sección
            if data.get("visible", True):
                visibles = BloqueSeccion.query.filter_by(
                    id_seccion=data["id_seccion"],
                    visible=True
                ).count()

                if visibles >= 3:
                    return (make_response(
                        ResponseStatus.FAIL,
                        "Solo se permiten hasta 3 bloques visibles por sección",
                        {"limite": "Ya hay 3 bloques visibles en esta sección"}
                    ), 400)

            nuevo = BloqueSeccion(
                id_seccion=data["id_seccion"],
                tipo=data["tipo"],
                titulo=data["titulo"],
                contenido=data.get("contenido"),
                orden=data.get("orden"),
                visible=data["visible"]
            )
            db.session.add(nuevo)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Bloque creado", nuevo.to_dict()), 200,)

        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear bloque", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        bloque = BloqueSeccion.query.get(id)
        if not bloque:
            return (make_response(ResponseStatus.FAIL, "Bloque no encontrado"), 404,)

        try:
            nueva_visibilidad = data.get("visible", bloque.visible)
            nueva_seccion_id = data.get("id_seccion", bloque.id_seccion)

            # Validar máximo 3 bloques visibles por sección (solo si va a activarse)
            if not bloque.visible and nueva_visibilidad:
                visibles = BloqueSeccion.query.filter_by(
                    id_seccion=nueva_seccion_id,
                    visible=True
                ).count()

                if visibles >= 3:
                    return (make_response(
                        ResponseStatus.FAIL,
                        "Ya hay 3 bloques visibles en esta sección",
                        {"limite": "Solo se permiten hasta 3 visibles por sección"}
                    ), 400,)

            bloque.id_seccion = nueva_seccion_id
            bloque.tipo = data.get("tipo", bloque.tipo)
            bloque.titulo = data.get("titulo", bloque.titulo)
            bloque.contenido = data.get("contenido", bloque.contenido)
            bloque.orden = data.get("orden", bloque.orden)
            bloque.visible = nueva_visibilidad

            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Bloque actualizado", bloque.to_dict()), 200,)

        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar bloque", {"error": str(e)}), 500)

    @staticmethod
    def delete(id):
        bloque = BloqueSeccion.query.get(id)
        if not bloque:
            return (make_response(ResponseStatus.FAIL, "Bloque no encontrado"), 404,)

        try:
            db.session.delete(bloque)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Bloque eliminado correctamente"), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al eliminar bloque", {"error": str(e)}), 500,)
