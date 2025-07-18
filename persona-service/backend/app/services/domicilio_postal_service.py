from app.models.domicilio_postal_model import DomicilioPostal
from app.schema.domicilio_postal_schema import DomicilioPostalSchema
from app.interfaces.domicilio_postal_interface import IDomicilioPostalInterface
from app.extensions import SessionLocal

class DomicilioPostalService(IDomicilioPostalInterface):
    

    def __init__(self):
        """Inicializa los esquemas de serialización."""
        self.schema=DomicilioPostalSchema()
        self.varios_schema=DomicilioPostalSchema(many=True)

    def listar_domicilio_postal_id(self, id):
        """Obtiene un domicilio postal por su ID."""
        session = SessionLocal()

        try:
            domicilio_postal=session.query(DomicilioPostal).get(id)

            if not domicilio_postal:
                return None
            
            return self.schema.dump(domicilio_postal)
        
        finally:
            session.close()



    def obtener_domicilio_postal_por_cod_postal_localidad(self, codigo_postal, localidad, session=None):
        """Busca un domicilio postal por código postal y localidad."""

        cerrar=False
        if session is None:
            session = SessionLocal()
            cerrar=True

        try:
            dom_postal  = session.query(DomicilioPostal).filter_by(
                codigo_postal=codigo_postal.strip(),
                localidad=localidad.strip()
                ).first()
            
            return dom_postal

        finally:
            if cerrar:
                session.close()     

    def buscar_localidades_por_codigo_postal(self, codigo_postal, session=None):
        """Devuelve una lista de localidades para un determinado Codigo Postal."""
        
        cerrar=False
        if session is None:
            session = SessionLocal()
            cerrar=True    

        try:

            lista_localidades= (session.query(DomicilioPostal.localidad)
                .filter(DomicilioPostal.codigo_postal==codigo_postal.strip())
                .distinct()
                .all()
                )
            
            return [fila.localidad for fila in lista_localidades]

        finally:
            if cerrar:
                session.close()                 

    #No se utiliza
    def crear_domicilio_postal(self, data, session=None):
        """Crea un nuevo registro de domicilio postal."""

        cerrar = False
        if session is None:    
            session= SessionLocal()
            cerrar=True

        try:
            data_validada=self.schema.load(data)
            domicilio_postal = DomicilioPostal(**data_validada)
            session.add(domicilio_postal)
            session.flush()

            return domicilio_postal
        except Exception as e:
            session.rollback()
            raise e
        finally:
            if cerrar:
                session.close()
             