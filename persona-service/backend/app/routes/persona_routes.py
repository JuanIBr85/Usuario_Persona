from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from app.services.persona_service import PersonaService
from app.schema.persona_schema import PersonaSchema
from app.utils.respuestas import respuesta_estandar,RespuestaStatus
from common.decorators.api_access import api_access

persona_bp = Blueprint('persona_bp', __name__)
persona_service = PersonaService()
persona_schema= PersonaSchema()

@api_access(access_permissions=[])
@persona_bp.route('/personas', methods=['GET'])
def listar_personas():
    try:
        personas =persona_service.listar_personas()

        return jsonify(respuesta_estandar(
            status=RespuestaStatus.SUCCESS, 
            message="Lista de personas obtenida" if personas else "No se encontraron resultados", 
            data=personas or []
        )), 200
    
    except Exception as e:
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.ERROR,
            message="",
            data={"server": str(e)}
        )),500
            
@api_access(access_permissions=[])
@persona_bp.route('/personas/<int:id>/', methods=['GET'])
def obtener_persona(id):
    try:
        persona = persona_service.listar_persona_id(id)

        if persona is None:
             
             return jsonify(respuesta_estandar(
                 status=RespuestaStatus.ERROR,
                 message="Persona no encontrada",
                 data={"id": f"No existe persona con ID {id}"}
             )), 404
        
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.SUCCESS,
            message="Persona obtenida correctamente",
            data=persona
        )), 200
    
    except Exception as e:
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.ERROR,
            message="Error al obtener persona",
            data={"server": str(e)}
        )),500    

#crea una persona
@api_access(access_permissions=[])
@persona_bp.route('/crear_persona', methods=['POST'])
def crear_persona():
    try:    
        data= request.get_json()

        if not data:
         return jsonify(respuesta_estandar(
             status=RespuestaStatus.ERROR,
             message="No se enviaron los datos",
             data=None
         )),400
        
        errors= persona_schema.validate(data)

        if errors:
            return jsonify(respuesta_estandar(
                status=RespuestaStatus.ERROR,
                message="Error de validacion",
                data=errors
            )),400
    
        persona = persona_service.crear_persona(data)

        return jsonify(respuesta_estandar(
            status= RespuestaStatus.SUCCESS,
            message="Recurso creado correctamente",
            data={"id": persona.id_persona}
        )),201
    
    except Exception as e:
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.ERROR, 
            message="Error interno del servidor", 
            data={"server": str(e)}
            )),500
    
# modificar persona, siguiendo el formato json sugerido    
@api_access(access_permissions=[])
@persona_bp.route('/modificar_persona/<int:id>', methods=['PUT'])
def modificar_persona(id):
    try:
        data = request.get_json()
        if not data:
            return jsonify(respuesta_estandar(
                status=RespuestaStatus.ERROR,
                message="No se enviaron datos",
                data=None               
            )), 400

        persona = persona_service.modificar_persona(id, data)
        if persona is None:
            return jsonify(respuesta_estandar(
                status=RespuestaStatus.ERROR,
                message="Persona no encontrada",
                data={"id": f"No existe persona con ID {id}"}
            )), 404

        return jsonify(respuesta_estandar(
            status=RespuestaStatus.SUCCESS, 
            message="Persona modificada correctamente", 
            data=persona
        )), 200

    except Exception as e:
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.ERROR, 
            message="Error al modificar persona", 
            data={"server": str(e)}
        )), 500

#borrar una persona
@api_access(access_permissions=[])
@persona_bp.route('/borrar_persona/<int:id>', methods=['DELETE'])
def borrar_persona(id):

    try:
        borrado_persona= persona_service.borrar_persona(id)

        if borrado_persona is None:
            return jsonify(respuesta_estandar(
                status=RespuestaStatus.ERROR, 
                message="Persona no encontrada", 
                data={"id": f"No existe persona con ID {id}"}
            )),404

        return  jsonify(respuesta_estandar(
            status=RespuestaStatus.SUCCESS, 
            message="Persona eliminada correctamente"
        )),200

    except Exception as e:
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.ERROR, 
            message="Error al eliminar persona", 
            data={"server": str(e)}
        )),500       

#Restaurar una persona
@api_access(access_permissions=[])
@persona_bp.route('/restaurar_persona/<int:id>', methods=['PATCH'])
def restaurar_persona(id):

    try:
        restaura_persona = persona_service.restaurar_persona(id)

        if restaura_persona is None:
            return jsonify(respuesta_estandar(
                status=RespuestaStatus.ERROR, 
                message="Persona no encontrada", 
                data={"id": f"No existe persona con ID {id}"}
            )),404
        
        if restaura_persona is False:
            return jsonify(respuesta_estandar(
                status=RespuestaStatus.ERROR, 
                message="La persona no está eliminada", 
                data={"id": f"La persona con ID {id} no está marcada como eliminada"}
            )),400
               
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.SUCCESS, 
            message="Persona restaurada correctamente"
        )),200
    
    except Exception as e:
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.ERROR, 
            message="Error al restaurar persona", 
            data={"server": str(e)}
        )),500

@api_access(access_permissions=[])
@persona_bp.route('/personas_by_usuario/<int:id>', methods=['GET'])
def obtener_persona_usuario(id):
    try:

        persona = persona_service.listar_persona_usuario_id(id)

        if persona is None:
             
             return respuesta_estandar(
                 status=RespuestaStatus.ERROR,
                 message="Persona no encontrada",
                 data={"id": f"No existe persona con ID {id}"}
             ), 404
        
        return respuesta_estandar(
            status=RespuestaStatus.SUCCESS,
            message="Persona obtenida correctamente",
            data=persona
        ), 200
    
    except Exception as e:
        return respuesta_estandar(
            status=RespuestaStatus.ERROR,
            message="Error al obtener persona",
            data={"server": str(e)}
        ),500