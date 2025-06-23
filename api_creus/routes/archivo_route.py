import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
from models import db
from services.archivo_service import ArchivoService
from routes.auth import get_token_required
from schemas.archivo_schema import (
    archivo_schema, archivos_schema,
    archivo_upload_schema, archivo_update_schema
)

token_required = get_token_required()
archivo_bp = Blueprint('archivo', __name__)

# Obtener todos los archivos
@archivo_bp.route('/', methods=['GET'])
@token_required
def get_all_archivos(current_user):
    try:
        archivos = ArchivoService.get_all()
        return jsonify({
            "status": "success",
            "data": archivos_schema.dump(archivos),
            "total": len(archivos)
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# Obtener un archivo por ID
@archivo_bp.route('/<int:id>', methods=['GET'])
@token_required
def get_archivo(current_user, id):
    try:
        archivo = ArchivoService.get_by_id(id)
        if not archivo or not archivo.activo:
            return jsonify({
                "status": "error",
                "message": "Archivo no encontrado"
            }), 404
            
        return jsonify({
            "status": "success",
            "data": archivo_schema.dump(archivo)
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# Descargar un archivo
@archivo_bp.route('/<int:id>/descargar', methods=['GET'])
@token_required
def download_archivo(current_user, id):
    try:
        archivo = ArchivoService.get_by_id(id)
        if not archivo or not archivo.activo:
            return jsonify({
                "status": "error",
                "message": "Archivo no encontrado"
            }), 404
        
        file_path = ArchivoService.get_file_path(archivo)
        if not file_path or not os.path.exists(file_path):
            return jsonify({
                "status": "error",
                "message": "El archivo no existe en el servidor"
            }), 404
            
        directory = os.path.dirname(file_path)
        filename = os.path.basename(archivo.ruta)
        return send_from_directory(
            directory=directory,
            path=filename,
            as_attachment=True,
            download_name=archivo.nombre
        )
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# Subir un nuevo archivo
@archivo_bp.route('/', methods=['POST'])
@token_required
def upload_archivo(current_user):
    try:
        # Validar que se haya enviado un archivo
        if 'archivo' not in request.files:
            return jsonify({
                "status": "error",
                "message": "No se ha proporcionado ningún archivo"
            }), 400
            
        archivo = request.files['archivo']
        id_convenio = request.form.get('id_convenio', type=int)
        id_institucion = request.form.get('id_institucion', type=int)
        
        # Validar datos
        data = {
            'archivo': archivo,
            'id_convenio': id_convenio,
            'id_institucion': id_institucion
        }
        
        errors = archivo_upload_schema.validate(data)
        if errors:
            return jsonify({
                "status": "error",
                "errors": errors
            }), 400
        
        # Determinar la subcarpeta según el tipo de archivo
        subfolder = 'generales'
        if id_convenio:
            subfolder = f'convenios/{id_convenio}'
        elif id_institucion:
            subfolder = f'instituciones/{id_institucion}'
        
        # Guardar el archivo
        file_data = ArchivoService.save_file(archivo, subfolder)
        
        # Crear registro en la base de datos
        nuevo_archivo = ArchivoService.create(
            file_data=file_data,
            user_id=current_user.id,
            convenio_id=id_convenio,
            institucion_id=id_institucion
        )
        
        return jsonify({
            "status": "success",
            "message": "Archivo subido exitosamente",
            "data": archivo_schema.dump(nuevo_archivo)
        }), 201
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# Actualizar metadatos de un archivo
@archivo_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_archivo(current_user, id):
    try:
        archivo = ArchivoService.get_by_id(id)
        if not archivo or not archivo.activo:
            return jsonify({
                "status": "error",
                "message": "Archivo no encontrado"
            }), 404
            
        data = request.get_json()
        errors = archivo_update_schema.validate(data)
        if errors:
            return jsonify({
                "status": "error",
                "errors": errors
            }), 400
            
        # Actualizar campos permitidos
        if 'id_convenio' in data:
            archivo.id_convenio = data['id_convenio']
        if 'id_institucion' in data:
            archivo.id_institucion = data['id_institucion']
            
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Archivo actualizado exitosamente",
            "data": archivo_schema.dump(archivo)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# Eliminar un archivo (soft delete)
@archivo_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_archivo(current_user, id):
    try:
        success = ArchivoService.delete(id)
        if not success:
            return jsonify({
                "status": "error",
                "message": "Archivo no encontrado"
            }), 404
            
        return jsonify({
            "status": "success",
            "message": "Archivo eliminado exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# Ruta para obtener los datos de los archivos en formato JSON
@archivo_bp.route('/datos')
def get_archivos_json():
    try:
        # Usar SQL directamente para evitar problemas de relaciones
        from sqlalchemy import text
        
        # Consulta SQL directa
        query = text("""
            SELECT a.id, a.nombre, a.tipo, a.tamaño, 
                   a.fecha_subida, a.subido_por,
                   a.id_convenio, c.nombre as nombre_convenio,
                   a.id_institucion, i.nombre as nombre_institucion
            FROM archivo a
            LEFT JOIN convenio c ON a.id_convenio = c.id
            LEFT JOIN institucion i ON a.id_institucion = i.id
            ORDER BY a.fecha_subida DESC
        """)
        
        result = db.session.execute(query)
        
        # Función para formatear el tamaño del archivo
        def format_size(size):
            if not size:
                return '0 B'
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
            return f"{size:.1f} TB"
        
        # Convertir el resultado a una lista de diccionarios
        archivos_data = []
        for row in result:
            archivos_data.append({
                'id': row[0],
                'nombre': row[1] or 'Sin nombre',
                'tipo': row[2] or 'Desconocido',
                'tamaño': format_size(row[3]) if row[3] is not None else '0 B',
                'fecha_subida': row[4].strftime('%Y-%m-%d %H:%M') if row[4] else '',
                'subido_por': row[5] or 'Desconocido',
                'id_convenio': row[6],
                'nombre_convenio': row[7] or 'Sin convenio',
                'id_institucion': row[8],
                'nombre_institucion': row[9] or 'Sin institución',
                'url_descarga': f'/api/archivos/{row[0]}/descargar' if row[0] else ''
            })
        
        return jsonify(archivos_data)
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
