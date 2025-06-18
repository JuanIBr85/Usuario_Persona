from abc import ABC, abstractmethod

class IPersonaExtendidaInterface(ABC):

    @abstractmethod
    def listar_personas_extendida(self):
        pass

    @abstractmethod
    def listar_persona_extendida_id(self, id):
        pass

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