from flask import Blueprint, request, jsonify, send_from_directory
from functools import wraps
import logging
from models import db
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from routes.auth import get_token_required
from services.institucion_service import InstitucionService

# Configuración de logging
logger = logging.getLogger(__name__)

# Inicialización del Blueprint
institucion_bp = Blueprint('institucion', __name__)

# Decorador para manejo de errores
def handle_errors(f):
    """
    Decorador para manejar errores comunes en las rutas.
    
    Args:
        f: Función a decorar.
        
    Returns:
        function: Función decorada con manejo de errores.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except SQLAlchemyError as e:
            logger.error(f"Error de base de datos: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Error en la base de datos",
                "errors": {"detalle": str(e)}
            }), 500
        except Exception as e:
            logger.error(f"Error inesperado: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Error interno del servidor",
                "errors": {"detalle": str(e)}
            }), 500
    return wrapper

# Obtener token_required
token_required = get_token_required()

@institucion_bp.route('/visualizar', methods=['GET'])
@handle_errors
def visualizar_instituciones():
    """
    Sirve la página estática para visualizar instituciones.
    
    Returns:
        Response: Archivo HTML estático de instituciones.
    """
    return send_from_directory('static', 'instituciones.html')

@institucion_bp.route('/', methods=['GET'])
@handle_errors
def get_all_instituciones():
    """
    Obtiene todas las instituciones registradas.
    
    Returns:
        JSON: Lista de instituciones con metadatos.
    """
    instituciones = InstitucionService.get_all()
    data = [institucion.to_dict() for institucion in instituciones]

    return jsonify({
        "status": "success",
        "data": data,
        "total": len(data),
        "message": "Instituciones obtenidas exitosamente"
    }), 200

@institucion_bp.route('/<int:id>', methods=['GET'])
@handle_errors
def get_institucion(id):
    """
    Obtiene una institución por su ID.
    
    Args:
        id (int): ID de la institución a buscar.
        
    Returns:
        JSON: Datos de la institución o mensaje de error.
    """
    institucion = InstitucionService.get_by_id(id)
    if not institucion:
        return jsonify({
            "status": "error",
            "message": f"Institución con ID {id} no encontrada"
        }), 404

    return jsonify({
        "status": "success",
        "data": institucion.to_dict(),
        "message": "Institución obtenida exitosamente"
    }), 200

@institucion_bp.route('/activas', methods=['GET'])
@handle_errors
def get_instituciones_activas():
    """
    Obtiene todas las instituciones activas.
    
    Returns:
        JSON: Lista de instituciones activas con metadatos.
    """
    instituciones = InstitucionService.get_activas()
    data = [inst.to_dict() for inst in instituciones]

    return jsonify({
        "status": "success",
        "data": data,
        "total": len(data),
        "message": "Instituciones activas obtenidas exitosamente"
    }), 200

@institucion_bp.route('/datos', methods=['GET'])
@handle_errors
def get_instituciones_json():
    """
    Obtiene datos básicos de instituciones en formato JSON.
    
    Returns:
        JSON: Datos básicos de instituciones.
    """
    query = text("""
        SELECT id, nombre, email, telefono, ciudad, provincia, pais, id_estado 
        FROM institucion
        WHERE activo = TRUE
    """)
    
    result = db.session.execute(query)
    instituciones_data = [
        {
            'id': row[0],
            'nombre': row[1],
            'email': row[2],
            'telefono': row[3],
            'ciudad': row[4],
            'provincia': row[5],
            'pais': row[6],
            'id_estado': row[7]
        }
        for row in result
    ]
    
    return jsonify({
        "status": "success",
        "data": instituciones_data,
        "total": len(instituciones_data),
        "message": "Datos de instituciones obtenidos exitosamente"
    }), 200

@institucion_bp.route('/', methods=['POST'])
#@token_required
@handle_errors
#def create_institucion(current_user):
def create_institucion():
    """
    Crea una nueva institución.
    
    Args:
        current_user: Usuario autenticado (proporcionado por el decorador).
        
    Request Body:
        JSON con los datos de la institución.
        
    Returns:
        JSON: Institución creada o mensaje de error.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({
            "status": "error",
            "message": "No se proporcionaron datos"
        }), 400
        
    try:
        institucion = InstitucionService.create(data)
        return jsonify({
            "status": "success",
            "data": institucion.to_dict(),
            "message": "Institución creada exitosamente"
        }), 201
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

@institucion_bp.route('/<int:id>', methods=['PUT'])
#@token_required
@handle_errors
#def update_institucion(current_user, id):
def update_institucion(id):
    """
    Actualiza una institución existente.
    
    Args:
        current_user: Usuario autenticado.
        id (int): ID de la institución a actualizar.
        
    Request Body:
        JSON con los campos a actualizar.
        
    Returns:
        JSON: Institución actualizada o mensaje de error.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({
            "status": "error",
            "message": "No se proporcionaron datos para actualizar"
        }), 400
        
    institucion = InstitucionService.update(id, data)
    if not institucion:
        return jsonify({
            "status": "error",
            "message": f"Institución con ID {id} no encontrada"
        }), 404
        
    return jsonify({
        "status": "success",
        "data": institucion.to_dict(),
        "message": "Institución actualizada exitosamente"
    }), 200

@institucion_bp.route('/<int:id>', methods=['DELETE'])
#@token_required
@handle_errors
#def delete_institucion(current_user, id):
def delete_institucion(id):
    """
    Elimina una institución (borrado lógico).
    
    Args:
        current_user: Usuario autenticado.
        id (int): ID de la institución a eliminar.
        
    Returns:
        JSON: Mensaje de éxito o error.
    """
    success = InstitucionService.delete(id)
    
    if not success:
        return jsonify({
            "status": "error",
            "message": f"No se pudo eliminar la institución con ID {id}"
        }), 404
        
    return jsonify({
        "status": "success",
        "message": "Institución eliminada exitosamente"
    }), 200