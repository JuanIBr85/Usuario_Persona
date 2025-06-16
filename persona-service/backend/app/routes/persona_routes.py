from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from app.services.persona_service import PersonaService
from app.schema.persona_schema import PersonaSchema
from common.decorators.api_access import api_access
from common.utils.response import make_response, ResponseStatus
from common.models.cache_settings import CacheSettings

persona_bp = Blueprint('persona_bp', __name__)
persona_service = PersonaService()
persona_schema= PersonaSchema()

@api_access(cache=CacheSettings(expiration=30))
@persona_bp.route('/personas', methods=['GET'])
def listar_personas():
    try:
        personas =persona_service.listar_personas()

        return make_response(
            status=ResponseStatus.SUCCESS, 
            message="Lista de personas obtenida" if personas else "No se encontraron resultados", 
            data=personas or []
        ), 200
    
    except Exception as e:
        return make_response(
            status=ResponseStatus.ERROR,
            message="",
            data={"server": str(e)}
        ),500
            
@api_access(cache=CacheSettings(expiration=10))
@persona_bp.route('/personas/<int:id>', methods=['GET'])
def obtener_persona(id):
    try:
        persona = persona_service.listar_persona_id(id)

        if persona is None:
             
             return make_response(
                 status=ResponseStatus.ERROR,
                 message="Persona no encontrada",
                 data={"id": f"No existe persona con ID {id}"}
             ), 404
        
        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Persona obtenida correctamente",
            data=persona
        ), 200
    
    except Exception as e:
        return make_response(
            status=ResponseStatus.ERROR,
            message="Error al obtener persona",
            data={"server": str(e)}
        ),500    

#crea una persona
@api_access(access_permissions=[])
@persona_bp.route('/crear_persona', methods=['POST'])
def crear_persona():
    try:    
        data= request.get_json()

        if not data:
         return make_response(
             status=ResponseStatus.ERROR,
             message="No se enviaron los datos",
             data=None
         ),400
        
        errors= persona_schema.validate(data)

        if errors:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Error de validacion",
                data=errors
            ),400
    
        persona = persona_service.crear_persona(data)

        return make_response(
            status= ResponseStatus.SUCCESS,
            message="Recurso creado correctamente",
            data={"id": persona.id_persona}
        ),201
    
    except Exception as e:
        return make_response(
            status=ResponseStatus.ERROR, 
            message="Error interno del servidor", 
            data={"server": str(e)}
            ),500
    
# modificar persona, siguiendo el formato json sugerido    
@api_access(access_permissions=[])
@persona_bp.route('/modificar_persona/<int:id>', methods=['PUT'])
def modificar_persona(id):
    try:
        data = request.get_json()
        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se enviaron datos",
                data=None               
            ), 400

        persona = persona_service.modificar_persona(id, data)
        if persona is None:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Persona no encontrada",
                data={"id": f"No existe persona con ID {id}"}
            ), 404

        return make_response(
            status=ResponseStatus.SUCCESS, 
            message="Persona modificada correctamente", 
            data=persona
        ), 200

    except Exception as e:
        return make_response(
            status=ResponseStatus.ERROR, 
            message="Error al modificar persona", 
            data={"server": str(e)}
        ), 500

#borrar una persona
@api_access(access_permissions=[])
@persona_bp.route('/borrar_persona/<int:id>', methods=['DELETE'])
def borrar_persona(id):

    try:
        borrado_persona= persona_service.borrar_persona(id)

        if borrado_persona is None:
            return make_response(
                status=ResponseStatus.ERROR, 
                message="Persona no encontrada", 
                data={"id": f"No existe persona con ID {id}"}
            ),404

        return  make_response(
            status=ResponseStatus.SUCCESS, 
            message="Persona eliminada correctamente"
        ),200

    except Exception as e:
        return make_response(
            status=ResponseStatus.ERROR, 
            message="Error al eliminar persona", 
            data={"server": str(e)}
        ),500       

#Restaurar una persona
@api_access(access_permissions=[])
@persona_bp.route('/restaurar_persona/<int:id>', methods=['PATCH'])
def restaurar_persona(id):

    try:
        restaura_persona = persona_service.restaurar_persona(id)

        if restaura_persona is None:
            return make_response(
                status=ResponseStatus.ERROR, 
                message="Persona no encontrada", 
                data={"id": f"No existe persona con ID {id}"}
            ),404
        
        if restaura_persona is False:
            return make_response(
                status=ResponseStatus.ERROR, 
                message="La persona no está eliminada", 
                data={"id": f"La persona con ID {id} no está marcada como eliminada"}
            ),400
               
        return make_response(
            status=ResponseStatus.SUCCESS, 
            message="Persona restaurada correctamente"
        ),200
    
    except Exception as e:
        return make_response(
            status=ResponseStatus.ERROR, 
            message="Error al restaurar persona", 
            data={"server": str(e)}
        ),500

@api_access(access_permissions=[])
@persona_bp.route('/personas_by_usuario/<int:id>', methods=['GET'])
def obtener_persona_usuario(id):
    try:

        persona = persona_service.listar_persona_usuario_id(id)

        if persona is None:
             
             return make_response(
                 status=ResponseStatus.ERROR,
                 message="Persona no encontrada",
                 data={"id": f"No existe persona con ID {id}"}
             ), 404
        
        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Persona obtenida correctamente",
            data=persona
        ), 200
    
    except Exception as e:
        return make_response(
            status=ResponseStatus.ERROR,
            message="Error al obtener persona",
            data={"server": str(e)}
        ),500
    
@persona_bp.route('/personas/count', methods=['GET'])
def contar_personas():
        try:
            total = persona_service.contar_personas()
            return make_response(
                status=ResponseStatus.SUCCESS,
                message="Cantidad de personas obtenida",
                data={"total": total}
            ), 200
        except Exception as e:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Error al contar personas",
                data={"server": str(e)}
            ), 500
