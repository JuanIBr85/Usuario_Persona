from models import db
from cms.models.imagen_model import Imagen
from utils.response_utils import make_response, ResponseStatus
from models import db


class ImagenService:

    @staticmethod  # obtener imagenes visibles
    def get_all_visibles():
        imagenes = Imagen.query.filter_by(visible=True).all()
        if not imagenes:
            return make_response(ResponseStatus.SUCCESS, "No hay imágenes visibles", None, 204)
        return make_response(ResponseStatus.SUCCESS, "Imágenes visibles obtenidas correctamente", [i.to_dict() for i in imagenes], 200)

    @staticmethod  # obtener todas las imagenes
    def get_all():
        imagenes = Imagen.query.all()
        if not imagenes:
            return make_response(ResponseStatus.SUCCESS, "No hay imágenes registradas", None, 204)
        return make_response(ResponseStatus.SUCCESS, "Todas las imágenes obtenidas correctamente", [i.to_dict() for i in imagenes], 200)

    @staticmethod  # crear imagen
    def create(data):
        duplicada = Imagen.query.filter_by(url=data["url"]).first()
        if duplicada:
            return make_response(
                ResponseStatus.FAIL,
                "Ya existe una imagen con esta URL",
                {"url": "Duplicado"},
                400
            )

        try:
            nueva = Imagen(
                nombre=data["nombre"],
                url=data["url"],
                tipo=data["tipo"],
                descripcion=data.get("descripcion"),
                id_noticia=data.get("id_noticia"),
                visible=data.get("visible", True)
            )
            db.session.add(nueva)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Imagen creada correctamente", nueva.to_dict(), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear la imagen", {"error": str(e)}, 500)

    @staticmethod  # modificar imagen
    def update(id, data):
        from sqlalchemy.exc import OperationalError
        
        try:
            imagen = Imagen.query.get(id)
            if not imagen:
                return make_response(ResponseStatus.FAIL, "Imagen no encontrada", {"detalle": f"El ID {id} no existe"}, 404)
        except OperationalError as e:
            if "Lost connection" in str(e) or "MySQL server has gone away" in str(e):
                try:
                    db.session.rollback()
                    db.engine.dispose()
                    imagen = Imagen.query.get(id)
                    if not imagen:
                        return make_response(ResponseStatus.FAIL, "Imagen no encontrada", {"detalle": f"El ID {id} no existe"}, 404)
                except Exception:
                    return make_response(ResponseStatus.ERROR, "Error de conexión a la base de datos", {"error": "Database connection failed"}, 500)
            else:
                return make_response(ResponseStatus.ERROR, "Error de base de datos", {"error": str(e)}, 500)
        except Exception as e:
            return make_response(ResponseStatus.ERROR, "Error interno", {"error": str(e)}, 500)

        duplicada = Imagen.query.filter(
            Imagen.url == data["url"],
            Imagen.id != id
        ).first()
        if duplicada:
            return make_response(
                ResponseStatus.FAIL,
                "Ya existe otra imagen con esta URL",
                {"url": "Duplicado"},
                400
            )
        # verifica si es tipo noticia, que esté cargado el id_noticia
        tipo = data.get("tipo", "").upper()
        if tipo == "NOTICIA" and not data.get("id_noticia"):
            return make_response(
                ResponseStatus.FAIL,
                "El campo id_noticia es obligatorio para imágenes de tipo 'noticia'",
                {"id_noticia": "Faltante para tipo 'noticia'"},
                400
            )

        # validación si intenta ocultar una imagen asociada a una noticia publicada
        if data.get("visible") is False and tipo == "NOTICIA" and data.get("id_noticia"):
            from cms.models.noticia_model import Noticia
            noticia = Noticia.query.get(data["id_noticia"])
            if noticia and noticia.estado == "publicado":
                return make_response(
                    ResponseStatus.FAIL,
                    "No se puede ocultar una imagen usada en una noticia publicada.",
                    {
                        "noticia_id": noticia.id,
                        "titulo": noticia.titulo,
                        "estado": noticia.estado
                    },
                    400
                )

        try:
            imagen.nombre = data.get("nombre", imagen.nombre)
            imagen.url = data.get("url", imagen.url)
            imagen.descripcion = data.get("descripcion", imagen.descripcion)
            imagen.visible = data.get("visible", imagen.visible)

            imagen.tipo = tipo
            # si el tipo es noticia guarda el id_noticia, si no lo deja vacio
            if tipo == "NOTICIA":
                imagen.id_noticia = data["id_noticia"]
            else:
                imagen.id_noticia = None

            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Imagen actualizada correctamente", imagen.to_dict(), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar la imagen", {"error": str(e)}, 500)

    @staticmethod  # ocultar imagen
    def delete(id):
        from sqlalchemy.exc import OperationalError
        
        try:
            imagen = Imagen.query.get(id)
            if not imagen:
                return make_response(ResponseStatus.FAIL, "Imagen no encontrada", {"id": f"{id}"}, 404)
        except OperationalError as e:
            if "Lost connection" in str(e) or "MySQL server has gone away" in str(e):
                try:
                    db.session.rollback()
                    db.engine.dispose()
                    imagen = Imagen.query.get(id)
                    if not imagen:
                        return make_response(ResponseStatus.FAIL, "Imagen no encontrada", {"id": f"{id}"}, 404)
                except Exception:
                    return make_response(ResponseStatus.ERROR, "Error de conexión a la base de datos", {"error": "Database connection failed"}, 500)
            else:
                return make_response(ResponseStatus.ERROR, "Error de base de datos", {"error": str(e)}, 500)
        except Exception as e:
            return make_response(ResponseStatus.ERROR, "Error interno", {"error": str(e)}, 500)

        if not imagen.visible:
            return make_response(ResponseStatus.FAIL, "La imagen ya está oculta", {"visible": "false"}, 400)

        #  validación si imagen está asociada a una noticia publicada
        if imagen.tipo == "noticia" and imagen.id_noticia:
            from cms.models.noticia_model import Noticia
            noticia = Noticia.query.get(imagen.id_noticia)
            if noticia and noticia.estado == "publicado":
                return make_response(
                    ResponseStatus.FAIL,
                    "No se puede ocultar una imagen vinculada a una noticia publicada.",
                    {
                        "noticia_id": noticia.id,
                        "titulo": noticia.titulo,
                        "estado": noticia.estado
                    },
                    400
                )

        try:
            imagen.visible = False
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Imagen marcada como no visible", {"id": id}, 200)
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar la imagen", {"error": str(e)}, 500)

    @staticmethod
    def get_file(id):
        from flask import send_file, abort
        import os
        from sqlalchemy.exc import OperationalError
        from models import db
        
        try:
            # intentar reconectar en caso de pérdida de conexión
            imagen = Imagen.query.get(id)
            if not imagen:
                abort(404)
        except OperationalError as e:
            # si hay error de conexión, intentar reconectar
            if "Lost connection" in str(e) or "MySQL server has gone away" in str(e):
                try:
                    db.session.rollback()
                    db.engine.dispose()  
                    imagen = Imagen.query.get(id)  # reintentar la consulta
                    if not imagen:
                        abort(404)
                except Exception:
                    abort(500) 
            else:
                abort(500)
        except Exception:
            abort(500)
        
        # construir la ruta del archivo basada en la URL almacenada
        file_path = imagen.url.lstrip('/')
        
        if not os.path.exists(file_path):
            abort(404)
        
        return send_file(file_path)