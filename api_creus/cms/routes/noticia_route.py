from flask import Blueprint, request
from cms.services.noticia_service import NoticiaService
from cms.schemas.noticia_schema import NoticiaSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

noticia_bp = Blueprint('noticia', __name__)

# Obtener todas las noticias 
@noticia_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def get_all():
    estado = request.args.get('estado')
    limit = request.args.get('limit', type=int)
    return NoticiaService.get_all(estado=estado, limit=limit)

# Obtener solo las noticias publicadas
@noticia_bp.route('/publicadas', methods=['GET'])
@api_access(is_public=True)
def get_publicadas():
    limit = request.args.get('limit', type=int)
    return NoticiaService.get_publicadas(limit=limit)

# Obtener noticia por ID
@noticia_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=True)
def get_by_id(id):
    return NoticiaService.get_by_id(id)

#Crear noticia
@noticia_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_noticia"])
def create():
    schema = NoticiaSchema()
    
    # Manejar tanto JSON como FormData
    if request.content_type and 'application/json' in request.content_type:
        data = request.get_json()
        imagen_file = None
    else:
        # FormData
        data = request.form.to_dict()
        imagen_file = request.files.get('imagen')
    
    print(f"Datos recibidos en el servidor: {data}")
    print(f"Content-Type: {request.content_type}")
    
    errores = schema.validate(data)
    if errores:
        print(f"Errores de validación: {errores}")
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    
    return NoticiaService.create(data, imagen_file)

#Editar noticia
@noticia_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_noticia"])
def update(id):
    schema = NoticiaSchema()
    schema.context = {'id': id}
    
    # Manejar tanto JSON como FormData
    if request.content_type and 'application/json' in request.content_type:
        data = request.get_json()
        imagen_file = None
    else:
        # FormData
        data = request.form.to_dict()
        imagen_file = request.files.get('imagen')
    
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    
    return NoticiaService.update(id, data, imagen_file)

#Eliminar noticia
@noticia_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_noticia"])
def delete(id):
    return NoticiaService.delete(id)
