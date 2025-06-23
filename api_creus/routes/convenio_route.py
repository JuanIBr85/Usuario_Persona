from flask import Blueprint, request, jsonify
from services.convenio_service import ConvenioService
from routes.auth import get_token_required
from schemas.convenio_schema import (
    convenio_schema, convenios_schema,
    convenio_create_schema, convenio_update_schema
)
from models import db
from utils.error_handlers import (
    handle_errors, not_found_error, 
    validation_error, conflict_error
)

# Configuración del Blueprint
convenio_bp = Blueprint('convenio', __name__)
token_required = get_token_required()

@convenio_bp.route('/', methods=['GET'])
@token_required
@handle_errors
def get_all_convenios(current_user):
    """
    Obtiene todos los convenios registrados.
    
    Returns:
        JSON: Lista de convenios con metadatos.
    """
    convenios = ConvenioService.get_all()
    return jsonify({
        "status": "success",
        "data": convenios_schema.dump(convenios),
        "total": len(convenios),
        "message": "Convenios obtenidos exitosamente"
    }), 200

@convenio_bp.route('/<int:id>', methods=['GET'])
@token_required
@handle_errors
def get_convenio(current_user, id):
    """
    Obtiene un convenio por su ID.
    
    Args:
        current_user: Usuario autenticado.
        id (int): ID del convenio a buscar.
        
    Returns:
        JSON: Datos del convenio o mensaje de error.
    """
    convenio = ConvenioService.get_by_id(id)
    if not convenio:
        return not_found_error(f"No se encontró el convenio con ID {id}")
        
    return jsonify({
        "status": "success",
        "data": convenio_schema.dump(convenio),
        "message": "Convenio obtenido exitosamente"
    }), 200

@convenio_bp.route('/institucion/<int:id_institucion>', methods=['GET'])
@token_required
@handle_errors
def get_convenios_por_institucion(current_user, id_institucion):
    """
    Obtiene los convenios asociados a una institución.
    
    Args:
        current_user: Usuario autenticado.
        id_institucion (int): ID de la institución.
        
    Returns:
        JSON: Lista de convenios de la institución.
    """
    convenios = ConvenioService.get_by_institucion(id_institucion)
    return jsonify({
        "status": "success",
        "data": convenios_schema.dump(convenios),
        "total": len(convenios),
        "message": f"Convenios de la institución {id_institucion} obtenidos exitosamente"
    }), 200

@convenio_bp.route('/', methods=['POST'])
@token_required
@handle_errors
def create_convenio(current_user):
    """
    Crea un nuevo convenio.
    
    Args:
        current_user: Usuario autenticado.
        
    Request Body:
        JSON con los datos del convenio.
        
    Returns:
        JSON: Convenio creado o mensaje de error.
    """
    data = request.get_json()
    
    # Validar datos de entrada
    errors = convenio_create_schema.validate(data)
    if errors:
        return validation_error(errors)
    
    # Verificar si ya existe un convenio con el mismo número
    if ConvenioService.existe_convenio(data.get('numero')):
        return conflict_error("Ya existe un convenio con este número")
    
    # Crear el convenio
    convenio = ConvenioService.create(data)
    
    return jsonify({
        "status": "success",
        "data": convenio_schema.dump(convenio),
        "message": "Convenio creado exitosamente"
    }), 201

@convenio_bp.route('/<int:id>', methods=['PUT'])
@token_required
@handle_errors
def update_convenio(current_user, id):
    """
    Actualiza un convenio existente.
    
    Args:
        current_user: Usuario autenticado.
        id (int): ID del convenio a actualizar.
        
    Request Body:
        JSON con los campos a actualizar.
        
    Returns:
        JSON: Convenio actualizado o mensaje de error.
    """
    data = request.get_json()
    
    # Validar datos de entrada
    errors = convenio_update_schema.validate(data, partial=True)
    if errors:
        return validation_error(errors)
    
    # Verificar si el convenio existe
    convenio = ConvenioService.get_by_id(id)
    if not convenio:
        return not_found_error(f"No se encontró el convenio con ID {id}")
    
    # Verificar si el nuevo número ya está en uso
    if 'numero' in data and data['numero'] != convenio.numero:
        if ConvenioService.existe_convenio(data['numero']):
            return conflict_error("Ya existe otro convenio con este número")
    
    # Actualizar el convenio
    convenio_actualizado = ConvenioService.update(convenio, data)
    
    return jsonify({
        "status": "success",
        "data": convenio_schema.dump(convenio_actualizado),
        "message": "Convenio actualizado exitosamente"
    }), 200

@convenio_bp.route('/<int:id>', methods=['DELETE'])
@token_required
@handle_errors
def delete_convenio(current_user, id):
    """
    Elimina un convenio (borrado lógico).
    
    Args:
        current_user: Usuario autenticado.
        id (int): ID del convenio a eliminar.
        
    Returns:
        JSON: Mensaje de éxito o error.
    """
    # Verificar si el convenio existe
    convenio = ConvenioService.get_by_id(id)
    if not convenio:
        return not_found_error(f"No se encontró el convenio con ID {id}")
    
    # Eliminar el convenio (borrado lógico)
    ConvenioService.delete(convenio)
    
    return jsonify({
        "status": "success",
        "message": "Convenio eliminado exitosamente"
    }), 200

@convenio_bp.route('/datos', methods=['GET'])
@handle_errors
def get_convenios_json():
    """
    Obtiene datos básicos de convenios en formato JSON.
    
    Returns:
        JSON: Datos básicos de convenios.
    """
    try:
        # Consulta SQL directa para evitar problemas de relaciones
        query = """
            SELECT c.id, c.numero, c.fecha_inicio, c.fecha_fin, 
                   i.nombre as nombre_institucion, c.estado
            FROM convenio c
            LEFT JOIN institucion i ON c.id_institucion = i.id
            WHERE c.activo = true
        """
        
        result = db.session.execute(query)
        
        # Convertir el resultado a una lista de diccionarios
        convenios_data = []
        for row in result:
            convenios_data.append({
                'id': row[0],
                'numero': row[1],
                'fecha_inicio': row[2].isoformat() if row[2] else None,
                'fecha_fin': row[3].isoformat() if row[3] else None,
                'institucion': row[4],
                'estado': row[5]
            })
        
        return jsonify({
            "status": "success",
            "data": convenios_data,
            "total": len(convenios_data),
            "message": "Datos de convenios obtenidos exitosamente"
        }), 200
        
    except Exception as e:
        # Este error será manejado por el decorador @handle_errors
        raise
