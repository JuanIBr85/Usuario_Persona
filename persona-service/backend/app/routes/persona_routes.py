from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, decode_token
from app.extensions import SessionLocal
from marshmallow import ValidationError
from app.services.persona_service import PersonaService
from app.schema.persona_schema import PersonaSchema
from app.models.persona_model import Persona
from common.decorators.api_access import api_access
from common.utils.response import make_response, ResponseStatus
from common.models.cache_settings import CacheSettings


persona_bp = Blueprint('persona_bp', __name__)
persona_service = PersonaService()
persona_schema= PersonaSchema()

@api_access(cache=CacheSettings(expiration=30), access_permissions=["persona.admin.ver_persona"])
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


def _obtener_persona_x_id(id):
        
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

    
@api_access(cache=CacheSettings(expiration=10))
@persona_bp.route('/persona_by_id/<int:id>', methods=['GET'])
def persona_by_id(id):
    try:
        return _obtener_persona_x_id(id)
    
    except Exception as e:
        return make_response(
            status=ResponseStatus.ERROR,
            message="Error al obtener persona",
            data={"server": str(e)}
        ),500 
            
@api_access(cache=CacheSettings(expiration=10), access_permissions=["persona.admin.ver_persona"])
@persona_bp.route('/personas/<int:id>', methods=['GET'])
def obtener_persona(id):
    try:
        return _obtener_persona_x_id(id)
    
    except Exception as e:
        return make_response(
            status=ResponseStatus.ERROR,
            message="Error al obtener persona",
            data={"server": str(e)}
        ),500    

#crea una persona
@api_access(access_permissions=["persona.admin.crear_persona"])
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
@api_access(access_permissions=["persona.admin.modificar_persona"])
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
@api_access(access_permissions=["persona.admin.eliminar_persona"])
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
@api_access(access_permissions=["persona.admin.restaurar_persona"])
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

@api_access(access_permissions=[])
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

@persona_bp.route('/personas/verify', methods=['POST'])
@jwt_required()
def verificar_persona():
    body = request.get_json() or {}
    token = body.get('token')
    datos = body.get('datos')

    if not token or not datos:
        return make_response(ResponseStatus.FAIL, "Faltan token o datos de persona"), 400

    
    try:
        session_claims = decode_token(token)
    except Exception:
        return make_response(ResponseStatus.FAIL, "Token invalido o expirado"), 400
    
    usuario_id = session_claims.get('sub')

    resultado = persona_service.verificar_o_crear_persona(usuario_id, datos)

    if 'otp_token' in resultado:
        return make_response(
            status=ResponseStatus.PENDING,
            message="Persona encontrada. Se envió código OTP.",
            data={'otp_token': resultado['otp_token']}
        ), 200

    return make_response(
        status=ResponseStatus.SUCCESS,
        message="Persona creada y vinculada correctamente.",
        data=resultado['persona']
    ), 201


@persona_bp.route('/personas/verify-otp', methods=['POST'])
def verificar_otp_persona():
    
    body = request.get_json() or {}
    token = body.get('token')
    codigo_input = body.get('codigo')

    if not token or not codigo_input:
        return make_response(ResponseStatus.FAIL, "Faltan token o código"), 400

    try:
        claims = decode_token(token)
    except Exception:
        return make_response(ResponseStatus.FAIL, "Token inválido o expirado"), 400

    persona_id = claims.get('persona_id')
    otp_guardado = claims.get('otp')
    usuario_id = claims.get('sub')

    if otp_guardado != codigo_input:
        return make_response(ResponseStatus.FAIL, "OTP incorrecto"), 400
    # vincula persona con usuario, actualiza usuario_id
    session = SessionLocal()
    try:
        session.query(Persona)\
               .filter_by(id_persona=persona_id)\
               .update({'usuario_id': usuario_id})
        session.commit()
        return make_response(ResponseStatus.SUCCESS, "Persona vinculada con usuario"), 200
    finally:
        session.close()
