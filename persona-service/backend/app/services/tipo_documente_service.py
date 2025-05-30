from app.models.tipo_doc_model import TipoDocumento
from app.schema.tipo_documento_schema import TipoDocumentoSchema
from app.interfaces.tipo_documento_interface import ITipoDocumentoInterface
from app.extensions import SessionLocal

class TipoDocumentoService(ITipoDocumentoInterface):

    def __init__(self):
        self.schema=TipoDocumentoSchema()

    def listar_tipo_doc_id(self, id):
        
        return

    def crear_tipo_documento(self, data, session = None):

        cerrar = False
        if session is None:
            session=SessionLocal()
            cerrar = True

        try:
            data_validada=self.schema.load(data)
            tipo_doc=TipoDocumento(**data_validada)
            session.add(tipo_doc)
            session.flush()
            return tipo_doc

        except Exception as e:
            session.rollback()    
            raise e
        
        finally:
            if cerrar:
                session.close()

    def modificar_tipo_documento(self, id_tipo_documento, data, session):
        tipo_doc = session.query(TipoDocumento).get(id_tipo_documento)
        if not tipo_doc:
            raise ValueError("Tipo de documento no encontrado")

        if 'tipo_documento' in data:
            tipo_doc.tipo_documento = data['tipo_documento']

        tipo_doc.updated_at = datetime.now(timezone.utc)
        session.flush() 

        return tipo_doc