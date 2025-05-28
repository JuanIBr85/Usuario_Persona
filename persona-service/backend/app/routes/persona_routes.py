from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from app.services.persona_service import PersonaService

persona_bp = Blueprint('persona_bp', __name__)
persona_service = PersonaService()

# Listar personas
@persona_bp.route('/personas', methods=['GET'])
def listar_personas():
    personas = persona_service.listar_personas()
    return jsonify(personas), 200

# Buscar persona por ID
@persona_bp.route('/personas/<int:id>', methods=['GET'])
def obtener_persona(id):
    persona = persona_service.listar_persona_id(id)
    if persona is None:
        return jsonify({"error": "Persona no encontrada"}), 404
    return jsonify(persona), 200

#crea una persona
@persona_bp.route('/crear_persona', methods=['POST'])
def crear_persona():
    try:    
        data= request.get_json()

        if not data:
         return jsonify({"error": "No se enviaron datos"}),400
    
        persona = persona_service.crear_persona(data)

        return jsonify({
            "status": "success",
            "message": "Recurso creado correctamente",
            "data":{
                "id": persona.id_persona
            }
        }),201
    
    except ValidationError as err:
        return jsonify({
            "status": "error",
            "message": "Error de validación",
            "errors": err.messages
        }),400
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "errors": {"server": str(e)}
        }),500




