from app.models.tipo_doc_model import Tipo_Documento
from app.schema.tipo_documento_schema import TipoDocumentoSchema
from app.interfaces.tipo_documento_interface import ITipoDocumentoInterface
from app.extensions import Base

class TipoDocumentoService(ITipoDocumentoInterface):

    def __init__(self):
        self.schema=TipoDocumentoSchema()
        self.varios_schema=TipoDocumentoSchema(many=True)

    def listar_tipo_doc_id(self, id):
        return

    def crear_tipo_documento(self, data):
        return    