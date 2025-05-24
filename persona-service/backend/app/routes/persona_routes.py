from flask import Blueprint, jsonify
from app.services.persona_service import PersonaService

persona_bp = Blueprint('persona_bp', __name__)
persona_service = PersonaService()

@persona_bp.route('/personas', methods=['GET'])
def listar_personas():
    personas = persona_service.listar_personas()
    return jsonify(personas), 200
