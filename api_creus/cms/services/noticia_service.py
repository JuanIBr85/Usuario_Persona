from models import db
from cms.models.noticia_model import Noticia
from utils.response_utils import make_response, ResponseStatus
from flask import current_app
from models import db
import os
import uuid
from werkzeug.utils import secure_filename


class NoticiaService:

    @staticmethod
    def get_all(estado=None, limit=None):
        query = Noticia.query
        
        # filtrar por estado si se proporciona
        if estado:
            query = query.filter(Noticia.estado == estado)
        
        # ordenar por ID descendente (más recientes primero)
        query = query.order_by(Noticia.id.desc())
        
        # aplicar límite si se proporciona
        if limit:
            query = query.limit(limit)
        
        noticias = query.all()
        return make_response(ResponseStatus.SUCCESS, "Noticias obtenidas", [n.to_dict() for n in noticias], 200)

    @staticmethod
    def get_publicadas(limit=None):
        query = Noticia.query.filter(Noticia.estado == 'publicado')
        
        # ordenar por fecha de publicación descendente (más recientes primero)
        query = query.order_by(Noticia.fecha_publicacion.desc())
        
        # aplicar límite si se proporciona
        if limit:
            query = query.limit(limit)
        
        noticias = query.all()
        return make_response(ResponseStatus.SUCCESS, "Noticias publicadas obtenidas", [n.to_dict() for n in noticias], 200)

    @staticmethod
    def get_by_id(id):
        noticia = Noticia.query.get(id)
        if not noticia:
            return make_response(ResponseStatus.FAIL, "Noticia no encontrada", None, 404)
        return make_response(ResponseStatus.SUCCESS, "Noticia obtenida", noticia.to_dict(), 200)

    @staticmethod
    def create(data, imagen_file=None):
        try:
            # si hay imagen_id, obtener la URL de la imagen y asociarla con la noticia
            imagen_id = data.get('imagen_id')
            if imagen_id:
                from cms.models.imagen_model import Imagen
                imagen = Imagen.query.get(imagen_id)
                if imagen:
                    # mantener imagen_id ya que es un campo del modelo Noticia
                    data['imagen_id'] = imagen_id
            
            # manejar archivo de imagen si se proporciona (mantener compatibilidad)
            elif imagen_file and imagen_file.filename:
                # crear directorio de uploads si no existe
                upload_dir = os.path.join(current_app.root_path, 'uploads')
                os.makedirs(upload_dir, exist_ok=True)
                
                # generar nombre único para el archivo
                filename = secure_filename(imagen_file.filename)
                name, ext = os.path.splitext(filename)
                unique_filename = f"{uuid.uuid4().hex}{ext}"
                
                # guardar archivo
                file_path = os.path.join(upload_dir, unique_filename)
                imagen_file.save(file_path)
            
            nueva = Noticia(**data)
            db.session.add(nueva)
            db.session.flush()  # para obtener el ID de la noticia
            
            # si hay imagen_id, actualizar la imagen para asociarla con la noticia
            if imagen_id:
                from cms.models.imagen_model import Imagen
                imagen = Imagen.query.get(imagen_id)
                if imagen:
                    imagen.id_noticia = nueva.id
                    imagen.tipo = 'noticia'
            
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Noticia creada", nueva.to_dict(), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear noticia", {"error": str(e)}, 500)

    @staticmethod
    def update(id, data, imagen_file=None):
        noticia = Noticia.query.get(id)
        if not noticia:
            return make_response(ResponseStatus.FAIL, "Noticia no encontrada", None, 404)
        try:
            # si hay imagen_id, obtener la URL de la imagen y asociarla con la noticia
            imagen_id = data.get('imagen_id')
            if imagen_id:
                from cms.models.imagen_model import Imagen
                imagen = Imagen.query.get(imagen_id)
                if imagen:
                    # mantener imagen_id ya que es un campo del modelo Noticia
                    data['imagen_id'] = imagen_id
                    # actualizar la imagen para asociarla con la noticia
                    imagen.id_noticia = noticia.id
                    imagen.tipo = 'noticia'
            
            elif imagen_file and imagen_file.filename:
                # si no existe la carpeta uploads, crearla
                upload_dir = os.path.join(current_app.root_path, 'uploads')
                os.makedirs(upload_dir, exist_ok=True)
                
                # nombre único para el archivo (UUID) para que no se repitan los nombres
                filename = secure_filename(imagen_file.filename)
                name, ext = os.path.splitext(filename)
                unique_filename = f"{uuid.uuid4().hex}{ext}"
                
                # guardar archivo
                file_path = os.path.join(upload_dir, unique_filename)
                imagen_file.save(file_path)
                
                # agregar la URL de la imagen a los datos
                data['imagen_url'] = f"/uploads/{unique_filename}"
            
            for key, value in data.items():
                setattr(noticia, key, value)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Noticia actualizada", noticia.to_dict(), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar", {"error": str(e)}, 500)

    @staticmethod
    def delete(id):
        noticia = Noticia.query.get(id)
        if not noticia:
            return make_response(ResponseStatus.FAIL, "Noticia no encontrada", None, 404)
        try:
            db.session.delete(noticia)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Noticia eliminada", None, 204)
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar", {"error": str(e)}, 500)
