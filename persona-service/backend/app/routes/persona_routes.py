from flask import Blueprint, jsonify, request
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

    data= request.json()

    if not data:
        return jsonify({"error": "Persona no encontrada"}),400
    
    persona, errores = persona_service.crear_persona(data)

    if errores:
        return jsonify(errores),422

    return jsonify(persona),200

