from app.models.service_model import ServiceModel
from app.services.servicio_base import ServicioBase
from app.schemas.service_schema import ServiceSchema

services_service: ServicioBase = ServicioBase(ServiceModel, ServiceSchema())


class ServicesSearchService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ServicesSearchService, cls).__new__(cls)
        return cls._instance

    def get_services(self) -> list[ServiceModel]:
        return services_service.get_all(not_dump=True)
