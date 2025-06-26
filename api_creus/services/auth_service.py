from models.usuario import Usuario
from models import db
import jwt
import datetime
from config import Config

class AuthService:
    @staticmethod
    def authenticate_user(username, password):
        """
        Autenticar usuario y generar token JWT
        """
        usuario = Usuario.query.filter_by(username=username).first()
        
        if not usuario or not usuario.check_password(password):
            return None, "Credenciales inválidas"
            
        if not usuario.estado:
            return None, "Usuario desactivado"
            
        # Generar token JWT
        token = jwt.encode({
            'user_id': usuario.id,
            'username': usuario.username,
            'rol': usuario.rol,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, Config.JWT_SECRET_KEY)
        
        return {
            'token': token,
            'usuario': usuario.to_dict()
        }, None
    
    @staticmethod
    def create_user(data, created_by=None):
        """
        Crear un nuevo usuario
        """
        if Usuario.query.filter_by(username=data['username']).first():
            return None, "El nombre de usuario ya está en uso"
            
        if 'email' in data and data['email'] and Usuario.query.filter_by(email=data['email']).first():
            return None, "El correo electrónico ya está en uso"
            
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
        
        return nuevo_usuario.to_dict(), None
    
    @staticmethod
    def update_user(user_id, data):
        """
        Actualizar datos de usuario
        """
        usuario = Usuario.query.get(user_id)
        
        if not usuario:
            return None, "Usuario no encontrado"
            
        if 'username' in data and data['username'] != usuario.username:
            if Usuario.query.filter_by(username=data['username']).first():
                return None, "El nombre de usuario ya está en uso"
            usuario.username = data['username']
            
        if 'email' in data and data['email'] != usuario.email:
            if Usuario.query.filter_by(email=data['email']).first():
                return None, "El correo electrónico ya está en uso"
            usuario.email = data['email']
            
        if 'password' in data and data['password']:
            usuario.set_password(data['password'])
            
        if 'nombre' in data:
            usuario.nombre = data['nombre']
        if 'apellido' in data:
            usuario.apellido = data['apellido']
        if 'rol' in data:
            usuario.rol = data['rol']
        if 'estado' in data:
            usuario.estado = data['estado']
            
        db.session.commit()
        
        return usuario.to_dict(), None