from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from app.services.persona_service import PersonaService
from app.schema.persona_schema import PersonaSchema

persona_bp = Blueprint('persona_bp', __name__)
persona_service = PersonaService()
persona_schema= PersonaSchema()


# Listar personas
@persona_bp.route('/personas', methods=['GET'])
def listar_personas():
    personas = persona_service.listar_personas()
    return jsonify(personas), 200

#Listar Todas las Personas, considerando formato JSON estandarizado por Rodrigo (Propuesta):
@persona_bp.route('/todas_personas', methods=['GET'])
def todas_personas():
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
    
#Listar persona, considerando formato JSON estandarizado por Rodrigo (Propuesta):

@persona_bp.route('/persona/<int:id>', methods=['GET'])
def obtener_persona_id(id):

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




