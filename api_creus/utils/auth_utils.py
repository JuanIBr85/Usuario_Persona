import jwt
from functools import wraps
from flask import request, jsonify
from models.usuario import Usuario
from config import Config

def token_required(f):
    """
    Decorador para proteger rutas que requieren autenticación
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'mensaje': 'Token es requerido!'}), 401
        
        try:
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            current_user = Usuario.query.filter_by(id=data['user_id']).first()
            
            if not current_user:
                return jsonify({'mensaje': 'Usuario no encontrado!'}), 401
                
            if not current_user.estado:
                return jsonify({'mensaje': 'Usuario desactivado!'}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'mensaje': 'Token expirado. Por favor, inicie sesión nuevamente!'}), 401
            
        except jwt.InvalidTokenError:
            return jsonify({'mensaje': 'Token inválido!'}), 401
            
        # Pasar el usuario actual a la función protegida
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """
    Decorador para proteger rutas que requieren permisos de administrador
    """
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.rol != 'admin':
            return jsonify({'mensaje': 'Se requieren permisos de administrador!'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated