import csv
from app.extensions import SessionLocal
from app.models.domicilio_postal_model import DomicilioPostal


def cargar_domicilios_postales_csv(path_csv):

    session=SessionLocal()

    try:
        with open(path_csv, newline='',encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            print("Encabezados encontrados en el CSV:", reader.fieldnames)
            domicilios_postales=[]

            required_fields = {'codigo_postal', 'localidad', 'partido', 'provincia'}
            if not required_fields.issubset(reader.fieldnames):
                raise ValueError(f"El CSV debe contener las columnas: {', '.join(required_fields)}")    
            
            claves_vistas = set()

            for row in reader:       
                        codigo_postal=row['codigo_postal'].strip() if row['codigo_postal'] else ''
                        localidad=row['localidad'].strip() if row['localidad'] else ''
                        partido=row['partido'].strip() if row['partido'] else ''
                        provincia=row['provincia'].strip() if row['provincia'] else ''

                        if not (codigo_postal and localidad and partido and provincia):
                             print (f"Fila incompleta ignorada: {row}")
                             continue
                        
                        if codigo_postal.lower()==localidad.lower():
                             print(f"Fila omitida porque codigo_postal y localidad son iguales: {row}")
                             continue
                        
                        clave=(codigo_postal,localidad)

                        if clave in claves_vistas:
                             print(f"Duplicado en CSV omitido: {row}")
                             continue
                        
                        claves_vistas.add(clave)
                        
                        existe = session.query(DomicilioPostal).filter_by(
                             codigo_postal=codigo_postal,
                             localidad=localidad
                        ).first()

                        if not existe:
                             domicilio_postal = DomicilioPostal(
                            codigo_postal=codigo_postal,
                            localidad=localidad,
                            partido=partido,
                            provincia=provincia,
                        )
            
                        domicilios_postales.append(domicilio_postal)

            if domicilios_postales:
                session.bulk_save_objects(domicilios_postales)
                session.commit()
                print(f"Se cargaron {len(domicilios_postales)} domicilios postales correctamente.")
            else:
                print("No se cargaron domicilios postales, existen o el archivo esta vacio.")    

    except Exception as e:
        session.rollback()
        print("Error al cargar domicilios postales:", e)
        raise

    finally:
        session.close()        



