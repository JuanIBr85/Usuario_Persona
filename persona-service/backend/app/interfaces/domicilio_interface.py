from abc import ABC, abstractmethod

class IDomicilioInterface(ABC):

    @abstractmethod
    def listar_domicilio_id(self, id):
        pass

    @abstractmethod
    def crear_domicilio(self, data):
        pass

    @abstractmethod
    def modificar_domicilio(self, id):
        pass

    @abstractmethod
    def borrar_domicilio(self, id):
        pass