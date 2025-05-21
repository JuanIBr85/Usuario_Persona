from sqlalchemy import Column, Integer, String
from app.database.session import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre_usuario = Column(String, unique=True, nullable=False)
    email_usuario = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)