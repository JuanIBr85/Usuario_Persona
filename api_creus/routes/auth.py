from flask import Blueprint, request, jsonify
from models.usuario import Usuario
from models import db
import jwt
import datetime
from functools import wraps
from config import Config

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
            response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
            return response
        
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                else:
                    token = auth_header
            except IndexError:
                return jsonify({'mensaje': 'Formato de token inválido.'}), 401
        
        if not token:
            return jsonify({'mensaje': 'Token es requerido.'}), 401
        
        try:
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            current_user = Usuario.query.filter_by(id=data['user_id']).first()
            
            if not current_user:
                return jsonify({'mensaje': 'Usuario no encontrado.'}), 401
                
            if not current_user.estado:
                return jsonify({'mensaje': 'Usuario desactivado.'}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'mensaje': 'Token expirado. Por favor, inicie sesión nuevamente.'}), 401
            
        except jwt.InvalidTokenError:
            return jsonify({'mensaje': 'Token inválido.'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
@token_required
def register(current_user):
    if current_user.rol != 'admin':
        return jsonify({'mensaje': 'No tienes permisos para realizar esta acción.'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'mensaje': 'Datos incompletos.'}), 400
    
    if Usuario.query.filter_by(username=data['username']).first():
        return jsonify({'mensaje': 'El usuario ya existe.'}), 400
        
    nuevo_usuario = Usuario(
        username=data['username'],
        nombre=data.get('nombre', ''),
        apellido=data.get('apellido', ''),
        email=data.get('email', ''),
        rol=data.get('rol', 'admin')
    )
    
    nuevo_usuario.set_password(data['password'])
    
    db.session.add(nuevo_usuario)
    db.session.commit()
    
    return jsonify({'mensaje': 'Usuario registrado correctamente.'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'mensaje': 'Datos incompletos!'}), 400
        
    usuario = Usuario.query.filter_by(username=data['username']).first()
    
    if not usuario or not usuario.check_password(data['password']):
        return jsonify({'mensaje': 'Credenciales inválidas.'}), 401
        
    if not usuario.estado:
        return jsonify({'mensaje': 'Usuario desactivado.'}), 401
        
    access_token = jwt.encode({
        'user_id': usuario.id,
        'username': usuario.username,
        'rol': usuario.rol,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    }, Config.JWT_SECRET_KEY)
    
    refresh_token = jwt.encode({
        'user_id': usuario.id,
        'type': 'refresh',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, Config.JWT_SECRET_KEY)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'usuario': usuario.to_dict()
    }), 200

@auth_bp.route('/perfil', methods=['GET'])
@token_required
def get_perfil(current_user):
    return jsonify({'usuario': current_user.to_dict()}), 200

def get_token_required():
    return token_required

@auth_bp.route('/refresh-token', methods=['POST'])
def refresh_token():
    data = request.get_json()
    
    if not data or not data.get('refresh_token'):
        return jsonify({'mensaje': 'Token de refresco requerido!'}), 400
        
    try:
        payload = jwt.decode(data['refresh_token'], Config.JWT_SECRET_KEY, algorithms=['HS256'])
        
        if payload.get('type') != 'refresh':
            return jsonify({'mensaje': 'Token inválido!'}), 401
            
        usuario = Usuario.query.filter_by(id=payload['user_id']).first()
        
        if not usuario or not usuario.estado:
            return jsonify({'mensaje': 'Usuario no encontrado o desactivado!'}), 401
            
        access_token = jwt.encode({
            'user_id': usuario.id,
            'username': usuario.username,
            'rol': usuario.rol,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        }, Config.JWT_SECRET_KEY)
        
        return jsonify({
            'access_token': access_token,
            'usuario': usuario.to_dict()
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({'mensaje': 'Token de refresco expirado. Por favor, inicie sesión nuevamente.'}), 401
        
    except jwt.InvalidTokenError:
        return jsonify({'mensaje': 'Token de refresco inválido.'}), 401