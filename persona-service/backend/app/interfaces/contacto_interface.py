from abc import ABC, abstractmethod

class IContactoInterface(ABC):

    @abstractmethod
    def listar_contacto_id(self, id):
        pass

    @abstractmethod
    def crear_contacto(self, data):
        pass

    @abstractmethod
    def modificar_contacto(self, id, data):
        pass