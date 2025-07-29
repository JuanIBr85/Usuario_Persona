from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, BigInteger
from app.extensions import Base

class Registro(Base):
    """
    Modelo que representa la tabla 'registro' en la base de datos.
    """
    __tablename__ = 'registro'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow, nullable=True)
    mensaje_recibido = Column(String(1000), default='')
    mensaje_enviado = Column(String(1000), default='')
    id_wa = Column(String(1000), default='')
    timestamp_wa = Column(BigInteger, nullable=True)
    telefono_wa = Column(String(50), default='')
    
    def __repr__(self):
        return f"<Registro(id={self.id}, telefono_wa='{self.telefono_wa}')>"
    
    def to_dict(self):
        """
        Convierte el objeto Registro a un diccionario.
        """
        return {
            'id': self.id,
            'fecha_hora': self.fecha_hora.isoformat() if self.fecha_hora else None,
            'mensaje_recibido': self.mensaje_recibido,
            'mensaje_enviado': self.mensaje_enviado,
            'id_wa': self.id_wa,
            'timestamp_wa': self.timestamp_wa,
            'telefono_wa': self.telefono_wa
        }
