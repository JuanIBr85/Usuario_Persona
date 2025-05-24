from abc import ABC, abstractmethod

class ITipoDocumentoInterface(ABC):

    @abstractmethod
    def listar_tipo_doc_id(self,id):
        pass

    @abstractmethod
    def crear_tipo_documento(self,data):
        pass