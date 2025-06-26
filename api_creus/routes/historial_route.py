from flask import Blueprint, jsonify
from services.historial_service import HistorialService 
from routes.auth import get_token_required

historial_bp = Blueprint('historial', __name__)
token_required = get_token_required()

#Obtener todos los logs
@historial_bp.route('/', methods = ['GET'])

def get_all_historial():
    historial = HistorialService.get_all()
    return jsonify([h.to_dict() for h in historial])


#Obtener logs por ID
@historial_bp.route('/<int:id>', methods = ['GET'])

def get_historial_by_id(id):
    h = HistorialService.get_by_id(id)
    if h:
        return jsonify(h.to_dict())
    return jsonify({
        "status": "error",
        "message": f"No se encontró el historial con ID: {id}"
    })

#Obtener logs por usuario
@historial_bp.route('/usuario/<int:id_usuario>', methods = ['GET'])

def get_historial_by_usuario(id_usuario):
    historial = HistorialService.get_by_usuario(id_usuario)
    return jsonify([h.to_dict() for h in historial])

#Obtener logs por tabla
@historial_bp.route('/tabla/<string:nombre_tabla>', methods = ['GET'])

def get_historial_by_tabla(nombre_tabla):
    historial = HistorialService.get_by_tabla(nombre_tabla)
    return jsonify([h.to_dict() for h in historial])