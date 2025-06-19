from app.extensions import Base
from sqlalchemy import Column, Integer, String, Boolean
from app.models.base_model import BaseModel


class ServiceModel(BaseModel):
    __tablename__ = "services"
    id_service = Column(Integer, primary_key=True)
    # Datos del servicio
    service_name = Column(String(100), nullable=False, unique=True)
    service_description = Column(String(255), nullable=False)

    # Url del servicio
    service_url = Column(String(255), nullable=False, unique=True)
    service_prefix = Column(String(20), nullable=False)
    # Indica si es un servicio core, es decir, si es un servicio que no se puede deshabilitar
    service_core = Column(Boolean, nullable=True, default=False)

    # Indica si el servicio esta disponible
    service_available = Column(Boolean, nullable=True, default=True)

    # Indica si la api gateway debe de esperar al servicio para iniciar
    service_wait = Column(Boolean, nullable=True, default=False)
