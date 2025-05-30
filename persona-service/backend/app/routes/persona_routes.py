from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from app.services.persona_service import PersonaService
from app.schema.persona_schema import PersonaSchema

persona_bp = Blueprint('persona_bp', __name__)
persona_service = PersonaService()
persona_schema= PersonaSchema()

@persona_bp.route('/personas', methods=['GET'])
def listar_personas():
    try:
        personas =persona_service.listar_personas()

        if not personas:
            return jsonify({
                "status": "success",
                "data": [],
                "total": 0,
                "message": "No se encontraron resultados"
            }),200

        return jsonify({
            "status": "success",
            "data": personas,
            "total": len(personas),
            "message": "Lista de personas obtenida"
        }),200
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error al obtener personas",
            "errors": {"server": str(e)}
        }),500  
    
@persona_bp.route('/personas/<int:id>', methods=['GET'])
def obtener_persona(id):

    try:

        persona = persona_service.listar_persona_id(id)

        if persona is None:
             return jsonify({
                 "status": "error",
                 "message": "Persona no encontrada",
                 "errors": {"id": f"No existe persona con ID {id}"}
                 }), 404
        
        return jsonify({
            "status": "success",
            "data": persona,
            "message": "Persona obtenida correctamente"
            }), 200
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error al obtener la persona",
            "errors": {"server": str(e)}
            }), 500

#crea una persona
@persona_bp.route('/crear_persona', methods=['POST'])
def crear_persona():
    try:    
        data= request.get_json()

        if not data:
         return jsonify({"error": "No se enviaron datos"}),400
        
        errors= persona_schema.validate(data)

        if errors:
            return jsonify({
                "status": "error",
                "message": "Error de validación",
                "errors": errors
            }),400
    
        persona = persona_service.crear_persona(data)

        return jsonify({
            "status": "success",
            "message": "Recurso creado correctamente",
            "data":{
                "id": persona.id_persona
            }
        }),201
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "errors": {"server": str(e)}
        }),500
    
# modificar persona, siguiendo el formato json sugerido    
@persona_bp.route('/modificar_persona/<int:id>', methods=['PUT'])
def modificar_persona(id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400

        persona = persona_service.modificar_persona(id, data)
        if persona is None:
            return jsonify({"error": "Persona no encontrada"}), 404

        return jsonify({
            "status": "success",
            "message": "Persona modificada correctamente",
            "data": persona
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error al modificar persona",
            "errors": {"server": str(e)}
        }), 500


#borrar una persona
@persona_bp.route('/borrar_persona/<int:id>', methods=['DELETE'])
def borrar_persona(id):

    try:

        borrado_persona= persona_service.borrar_persona(id)
        if borrar_persona:
            return  jsonify({
                "status": "success",
                "message": "Persona eliminada correctamente"
            }),200

        else:
            return jsonify({
                "status": "error",
                "message": "Persona no encontrada"
            }),404

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error al eliminar persona",
            "errors": {"server": str(e)}
        }),500       


