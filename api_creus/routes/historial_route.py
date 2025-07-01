from flask import Blueprint
from services.historial_service import HistorialService 
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

historial_bp = Blueprint('historial', __name__)


#Obtener todos los logs
@historial_bp.route('/', methods = ['GET'])
@api_access(is_public = False, access_permissions = ["creus.admin.ver_historial"])

def get_all_historial():
    return HistorialService.get_all()


#Obtener logs por ID
@historial_bp.route('/<int:id>', methods = ['GET'])
@api_access(is_public = False, access_permissions = ["creus.admin.ver_historial_id"])
def get_historial_by_id(id):
    return HistorialService.get_by_id(id)
#Obtener logs por usuario
@historial_bp.route('/usuario/<int:id_usuario>', methods = ['GET'])
@api_access(is_public = False, access_permissions = ["creus.admin.ver_historial_usuario"])
def get_historial_by_usuario(id_usuario):
    return HistorialService.get_by_usuario(id_usuario)

#Obtener logs por tabla
@historial_bp.route('/tabla/<string:nombre_tabla>', methods = ['GET'])
@api_access(is_public = False, access_permissions = ["creus.admin.ver_historial_tabla"])
def get_historial_by_tabla(nombre_tabla):
    return HistorialService.get_by_tabla(nombre_tabla)


#Obtener logs por tabla y registro
@historial_bp.route('/tabla/<string:nombre_tabla>/registro/<int:id_registro>', methods = ['GET'])
@api_access(is_public = False, access_permissions = ["creus.admin.ver_historial_tabla_registro"])
def get_historial_by_tabla_registro(nombre_tabla, id_registro):
    return HistorialService.get_by_tabla_registro(nombre_tabla, id_registro)