from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
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

# Modificar persona 
# revisar
@persona_bp.route('/personas/<int:id>', methods=['PUT'])
@jwt_required()
def modificar_persona(id):
    data = request.get_json()
    # Verifica id del usuario y rol para autorizar que datos puede modificar
    usuario_actual = get_jwt_identity() 

    persona_actualizada = persona_service.modificar_persona(id, data, usuario_actual)

    if not persona_actualizada:
        return {"message": "Persona no encontrada o no autorizado"}, 403

    return jsonify(persona_actualizada), 200

