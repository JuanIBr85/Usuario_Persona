import os
import uuid
import mimetypes
from werkzeug.utils import secure_filename
from flask import current_app
from models import db
from models.archivoModel import Archivo
from datetime import datetime
from werkzeug.exceptions import RequestEntityTooLarge
import logging

logger = logging.getLogger(__name__)

class ArchivoService:
    """
    Servicio para manejar operaciones relacionadas con archivos.
    
    Este servicio proporciona métodos para subir, validar y gestionar archivos
    de manera segura en el sistema.
    """
    
    # Tamaño máximo de archivo (16MB)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    # Extensiones permitidas y sus tipos MIME correspondientes
    ALLOWED_EXTENSIONS = {
        # Imágenes
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        
        # Documentos
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'odt': 'application/vnd.oasis.opendocument.text',
        'txt': 'text/plain',
        'rtf': 'application/rtf',
        
        # Hojas de cálculo
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ods': 'application/vnd.oasis.opendocument.spreadsheet',
        'csv': 'text/csv',
        
        # Archivos comprimidos
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed'
    }
    
    # Invertir el diccionario para búsqueda por MIME type
    EXTENSION_BY_MIME = {v: k for k, v in ALLOWED_EXTENSIONS.items()}
    
    # Categorías de archivos para organización
    FILE_CATEGORIES = {
        'images': {'jpg', 'jpeg', 'png', 'gif', 'webp'},
        'documents': {'pdf', 'doc', 'docx', 'odt', 'txt', 'rtf'},
        'spreadsheets': {'xls', 'xlsx', 'ods', 'csv'},
        'archives': {'zip', 'rar', '7z'}
    }
    
    @classmethod
    def get_file_extension(cls, filename):
        """
        Obtiene la extensión de un archivo en minúsculas.
        
        Args:
            filename (str): Nombre del archivo.
            
        Returns:
            str: Extensión del archivo en minúsculas o cadena vacía si no tiene.
        """
        return os.path.splitext(filename)[1][1:].lower() if '.' in filename else ''
    
    @classmethod
    def is_allowed_extension(cls, extension):
        """
        Verifica si una extensión está permitida.
        
        Args:
            extension (str): Extensión del archivo (sin punto).
            
        Returns:
            bool: True si la extensión está permitida, False en caso contrario.
        """
        return extension.lower() in cls.ALLOWED_EXTENSIONS
    
    @classmethod
    def get_mime_type(cls, file_path):
        """
        Obtiene el tipo MIME de un archivo basado en su extensión.
        
        Args:
            file_path (str): Ruta al archivo.
            
        Returns:
            str: Tipo MIME del archivo o 'application/octet-stream' si no se puede determinar.
        """
        mime_type, _ = mimetypes.guess_type(file_path)
        return mime_type or 'application/octet-stream'
    
    @classmethod
    def validate_file(cls, file_storage):
        """
        Valida un archivo antes de guardarlo.
        
        Args:
            file_storage (FileStorage): Objeto FileStorage de Flask.
            
        Returns:
            tuple: (bool, str) Indicador de éxito y mensaje de error si corresponde.
        """
        # Verificar si se envió un archivo
        if not file_storage or file_storage.filename == '':
            return False, 'No se ha seleccionado ningún archivo'
        
        # Obtener la extensión del archivo
        extension = cls.get_file_extension(file_storage.filename)
        
        # Verificar si la extensión está permitida
        if not cls.is_allowed_extension(extension):
            return False, f'Tipo de archivo no permitido: {extension}'
        
        # Verificar el tamaño del archivo
        file_storage.seek(0, os.SEEK_END)
        file_size = file_storage.tell()
        file_storage.seek(0)  # Rebobinar el archivo
        
        if file_size > cls.MAX_CONTENT_LENGTH:
            return False, f'El archivo es demasiado grande. Tamaño máximo permitido: {cls.MAX_CONTENT_LENGTH/1024/1024}MB'
        
        # Nota: Hemos eliminado la validación con imghdr para evitar dependencias externas
        # En producción, considera usar una biblioteca como Pillow para validar imágenes
        
        return True, ''
    
    @classmethod
    def generate_unique_filename(cls, filename):
        """
        Genera un nombre de archivo único usando UUID.
        
        Args:
            filename (str): Nombre original del archivo.
            
        Returns:
            str: Nombre de archivo único con la misma extensión.
        """
        extension = cls.get_file_extension(filename)
        unique_id = str(uuid.uuid4())
        return f"{unique_id}.{extension}" if extension else unique_id
    
    @classmethod
    def get_upload_folder(cls):
        """
        Obtiene la ruta de la carpeta de subida de archivos.
        
        Returns:
            str: Ruta completa a la carpeta de subida.
        """
        upload_folder = os.path.join(current_app.root_path, current_app.config['UPLOAD_FOLDER'])
        os.makedirs(upload_folder, exist_ok=True)
        return upload_folder
    
    @classmethod
    def save_file(cls, file_storage):
        """
        Guarda un archivo en el sistema de archivos.
        
        Args:
            file_storage (FileStorage): Objeto FileStorage de Flask.
            
        Returns:
            tuple: (str, str) Nombre del archivo guardado y ruta relativa, o (None, error)
        """
        # Validar el archivo
        is_valid, error_msg = cls.validate_file(file_storage)
        if not is_valid:
            return None, error_msg
        
        # Generar un nombre de archivo seguro y único
        original_filename = secure_filename(file_storage.filename)
        unique_filename = cls.generate_unique_filename(original_filename)
        
        # Obtener la carpeta de subida
        upload_folder = cls.get_upload_folder()
        file_path = os.path.join(upload_folder, unique_filename)
        
        try:
            # Guardar el archivo
            file_storage.save(file_path)
            
            # Obtener el tipo MIME real basado en la extensión
            mime_type = cls.get_mime_type(file_path)
            
            # Verificar que el tipo MIME coincida con la extensión
            extension = cls.get_file_extension(unique_filename)
            expected_mime = cls.ALLOWED_EXTENSIONS.get(extension)
            
            if expected_mime and mime_type != expected_mime:
                os.remove(file_path)  # Eliminar el archivo si la validación falla
                return None, 'El tipo de archivo no coincide con su extensión'
            
            # Devolver el nombre del archivo y la ruta relativa
            return unique_filename, os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
            
        except Exception as e:
            logger.error(f"Error al guardar el archivo: {str(e)}")
            return None, str(e)
    
    @classmethod
    def delete_file(cls, file_path):
        """
        Elimina un archivo del sistema de archivos.
        
        Args:
            file_path (str): Ruta relativa al archivo.
            
        Returns:
            bool: True si se eliminó correctamente, False en caso contrario.
        """
        try:
            full_path = os.path.join(current_app.root_path, file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                return True
            return False
        except Exception as e:
            logger.error(f"Error al eliminar el archivo {file_path}: {str(e)}")
            return False
    
    @classmethod
    def get_file_info(cls, file_path):
        """
        Obtiene información sobre un archivo.
        
        Args:
            file_path (str): Ruta relativa al archivo.
            
        Returns:
            dict: Información del archivo o None si no existe.
        """
        try:
            full_path = os.path.join(current_app.root_path, file_path)
            if not os.path.exists(full_path):
                return None
                
            extension = cls.get_file_extension(file_path)
            mime_type = cls.get_mime_type(full_path)
            
            return {
                'path': file_path,
                'filename': os.path.basename(file_path),
                'extension': extension,
                'mime_type': mime_type,
                'size': os.path.getsize(full_path),
                'created': datetime.fromtimestamp(os.path.getctime(full_path)),
                'modified': datetime.fromtimestamp(os.path.getmtime(full_path)),
                'category': next(
                    (cat for cat, exts in cls.FILE_CATEGORIES.items() 
                     if extension in exts), 'other')
            }
        except Exception as e:
            logger.error(f"Error al obtener información del archivo {file_path}: {str(e)}")
            return None

    @classmethod
    def get_all(cls):
        """Retrieve all active files."""
        return Archivo.query.filter_by(activo=True).all()
    
    @classmethod
    def get_by_id(cls, archivo_id):
        """Retrieve a file by its ID."""
        return Archivo.query.get(archivo_id)
    
    @classmethod
    def get_by_convenio(cls, convenio_id):
        """Retrieve all files associated with a convention."""
        return Archivo.query.filter_by(
            id_convenio=convenio_id, 
            activo=True
        ).all()
    
    @classmethod
    def get_by_institucion(cls, institucion_id):
        """Retrieve all files associated with an institution."""
        return Archivo.query.filter_by(
            id_institucion=institucion_id,
            activo=True
        ).all()
