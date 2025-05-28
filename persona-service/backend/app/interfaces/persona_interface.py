from abc import ABC, abstractmethod

class IPersonaInterface(ABC):

    @abstractmethod
    def listar_personas(self):
        pass

    @abstractmethod
    def listar_persona_id(self, id):
        pass

    @abstractmethod
    def crear_persona(self, data):
        pass  
        
    @abstractmethod
    def modificar_persona(self, id, data):
        pass    

    @abstractmethod
    def borrar_persona(self, id):
        pass
