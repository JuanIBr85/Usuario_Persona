from flask import Blueprint, request, send_from_directory
from cms.services.imagen_service import ImagenService
from cms.schemas.imagen_schema import ImagenSchema
from utils.response_utils import make_response, ResponseStatus
import os
from werkzeug.utils import secure_filename
import uuid
from common.decorators.api_access import CacheSettings, api_access

imagen_bp = Blueprint('imagen', __name__)

schema = ImagenSchema()
schema_many = ImagenSchema(many=True)

# Obtener todas las imágenes visibles
@imagen_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def obtener_imagenes_visibles():
    return ImagenService.get_all_visibles()

# Obtener todas las imágenes visibles y ocultas
@imagen_bp.route('/todas', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_todas_imagenes"])
def obtener_todas_imagenes():
    return ImagenService.get_all()

# Crear nueva imagen con archivo
@imagen_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_imagen"])
def crear_imagen():
    try:
        # Verificar si hay archivo en la request
        if 'imagen' not in request.files:
            return make_response(ResponseStatus.ERROR, "No se encontró archivo de imagen")
        
        file = request.files['imagen']
        if file.filename == '':
            return make_response(ResponseStatus.ERROR, "No se seleccionó archivo")
        
        # Validar tipo de archivo
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return make_response(ResponseStatus.ERROR, "Tipo de archivo no permitido")
        
        # Generar nombre único para el archivo
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Crear directorio si no existe
        upload_folder = os.path.join(os.getcwd(), 'uploads', 'imagenes')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Guardar archivo
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        # Crear URL relativa
        file_url = f"/uploads/imagenes/{unique_filename}"
        
        # Preparar datos para crear la imagen
        data = {
            'nombre': request.form.get('nombre', filename),
            'url': file_url,
            'tipo': request.form.get('tipo', 'noticia'),
            'descripcion': request.form.get('descripcion', ''),
            'visible': True
        }
        
        # Si hay id_noticia, agregarlo
        if request.form.get('id_noticia'):
            data['id_noticia'] = int(request.form.get('id_noticia'))
        
        return ImagenService.create(data)
        
    except Exception as e:
        return make_response(ResponseStatus.ERROR, f"Error al subir imagen: {str(e)}")

# Crear nueva imagen con JSON (mantener compatibilidad)
@imagen_bp.route('/json', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_imagen"])
def crear_imagen_json():
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)
    
    return ImagenService.create(data)

# Actualizar imagen
@imagen_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_imagen"])
def actualizar_imagen(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)
    
    return ImagenService.update(id, data)

# Eliminar (ocultar) imagen
@imagen_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.borrar_imagen"])
def eliminar_imagen(id):
    return ImagenService.delete(id)

# Servir archivos de imagen
@imagen_bp.route('/uploads/<path:filename>')
def uploaded_file(filename):
    upload_folder = os.path.join(os.getcwd(), 'uploads', 'imagenes')
    return send_from_directory(upload_folder, filename)

# Servir archivo de imagen
@imagen_bp.route('/<int:id>/archivo', methods=['GET'])
@api_access(is_public=True)
def servir_archivo_imagen(id):
    return ImagenService.get_file(id)