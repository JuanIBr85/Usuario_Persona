from models import db
from cms.models.publicacion_propuesta_model import PublicacionPropuesta
from utils.response_utils import make_response, ResponseStatus

class PublicacionPropuestaService:

    @staticmethod
    def get_all_visibles():
        publicaciones = PublicacionPropuesta.query.filter_by(visible=True).all()
        if not publicaciones:
            return make_response(ResponseStatus.SUCCESS, "No hay publicaciones visibles")
        return make_response(ResponseStatus.SUCCESS, "Publicaciones visibles obtenidas correctamente", [p.to_dict() for p in publicaciones])

    @staticmethod
    def get_all():
        publicaciones = PublicacionPropuesta.query.all()
        if not publicaciones:
            return make_response(ResponseStatus.SUCCESS, "No hay publicaciones registradas")
        return make_response(ResponseStatus.SUCCESS, "Todas las publicaciones obtenidas correctamente", [p.to_dict() for p in publicaciones])

    @staticmethod
    def create(data):
        # Verificar si ya existe una publicación con ese id_propuesta_educativa
        existente = PublicacionPropuesta.query.filter_by(id_propuesta_educativa=data["id_propuesta_educativa"]).first()
        if existente:
            return make_response(
                ResponseStatus.FAIL,
                "Ya existe una publicación para esta propuesta educativa",
                {"id_propuesta_educativa": "Duplicado"}
            )
        
        # Solo ejecutar si el nuevo registro es destacado y tiene una posición
        if data.get("destacada") and data.get("posicion") is not None:
            conflicto = PublicacionPropuesta.query.filter_by(
                posicion=data["posicion"],
                destacada=True,
                visible=True
            ).first()

            # Si se encuentra una publicación destacada con la misma posición y no es el mismo ID (para el PUT)
            if conflicto and conflicto.id != id:  # id = None en el POST
                return make_response(
                    ResponseStatus.FAIL,
                    f"La posición {data['posicion']} ya está ocupada por otra publicación destacada.",
                    {"posicion": "Ya en uso por otra destacada visible"}
                )

        try:
            nueva = PublicacionPropuesta(
                id_propuesta_educativa=data["id_propuesta_educativa"],
                destacada=data.get("destacada", False),
                posicion=data.get("posicion"),
                visible=data.get("visible", True)
            )
            db.session.add(nueva)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Publicación creada correctamente", nueva.to_dict())

        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear la publicación", {"error": str(e)})

    @staticmethod
    def update(id, data):
        publicacion = PublicacionPropuesta.query.get(id)
        if not publicacion:
            return make_response(ResponseStatus.FAIL, "Publicación no encontrada", {"detalle": f"El ID {id} no existe"})

        # Solo ejecutar si el nuevo registro es destacado y tiene una posición
        if data.get("destacada") and data.get("posicion") is not None:
            conflicto = PublicacionPropuesta.query.filter_by(
                posicion=data["posicion"],
                destacada=True,
                visible=True
            ).first()

            # Si se encuentra una publicación destacada con la misma posición y no es el mismo ID (para el PUT)
            if conflicto and conflicto.id != id:  # id = None en el POST
                return make_response(
                    ResponseStatus.FAIL,
                    f"La posición {data['posicion']} ya está ocupada por otra publicación destacada.",
                    {"posicion": "Ya en uso por otra destacada visible"}
                )

        nuevo_id_propuesta = data.get("id_propuesta_educativa", publicacion.id_propuesta_educativa)
        # Validar duplicado si el id_propuesta_educativa fue modificado
        if nuevo_id_propuesta != publicacion.id_propuesta_educativa:
            duplicado = PublicacionPropuesta.query.filter(
                PublicacionPropuesta.id_propuesta_educativa == nuevo_id_propuesta,
                PublicacionPropuesta.id != id  # <- acá se excluye la publicación actual
            ).first()

            if duplicado:
                return make_response(
                    ResponseStatus.FAIL,
                    "Ya existe una publicación con esa propuesta educativa",
                    {"id_propuesta_educativa": "Duplicado"}
                )

        try:
            publicacion.id_propuesta_educativa = nuevo_id_propuesta
            publicacion.destacada = data.get("destacada", publicacion.destacada)
            publicacion.posicion = data.get("posicion", publicacion.posicion)
            publicacion.visible = data.get("visible", publicacion.visible)

            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Publicación actualizada correctamente", publicacion.to_dict())

        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar la publicación", {"error": str(e)})

    @staticmethod
    def delete(id):
        publicacion = PublicacionPropuesta.query.get(id)
        if not publicacion:
            return make_response(ResponseStatus.FAIL, "Publicación no encontrada", {"id": f"{id}"})

        if not publicacion.visible:
            return make_response(ResponseStatus.FAIL, "La publicación ya está oculta", {"visible": "false"})

        try:
            publicacion.visible = False
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Publicación marcada como no visible", {"id": id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar la publicación", {"error": str(e)})
