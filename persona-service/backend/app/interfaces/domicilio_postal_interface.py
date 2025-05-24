from abc import ABC, abstractmethod

class IDomicilioPostalInterface(ABC):

    @abstractmethod
    def listar_domicilio_postal_id(self,id):
        pass

    @abstractmethod    
    def crear_domicilio_postal(self, data):
        pass