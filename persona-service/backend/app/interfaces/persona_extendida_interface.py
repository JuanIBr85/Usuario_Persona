from abc import ABC, abstractmethod

class IPersonaExtendidaInterface(ABC):

    @abstractmethod
    def crear_persona_extendida(self, data):
        pass  
        
    @abstractmethod
    def modificar_persona_extendida(self, id, data):
        pass    

    @abstractmethod
    def borrar_persona_extendida(self, id):
        pass

    @abstractmethod
    def restaurar_persona_extendida(self, id):
        pass