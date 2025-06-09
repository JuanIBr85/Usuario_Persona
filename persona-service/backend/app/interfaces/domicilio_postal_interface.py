from abc import ABC, abstractmethod

class IDomicilioPostalInterface(ABC):

    @abstractmethod
    def listar_domicilio_postal_id(self,id):
        pass

    @abstractmethod    
    def crear_domicilio_postal(self, data):
        pass

    @abstractmethod
    def obtener_domicilio_postal_por_cod_postal_localidad(self, codigo_postal, localidad):
        pass 

    @abstractmethod
    def buscar_localidades_por_codigo_postal(self, codigo_postal):
        pass