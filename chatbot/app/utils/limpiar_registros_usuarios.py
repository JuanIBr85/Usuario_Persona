from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from app.models.registro import Registro
from app.extensions import SessionLocal

def limpiar_registros_usuarios(umbral=50, dejar=5):
    """
    Por cada usuario (telefono_wa), si tiene más de 'umbral' registros,
    elimina los más antiguos y deja solo los últimos 'dejar' mensajes.
    """
    db = SessionLocal()
    
    try:
        # Obtener todos los números de teléfono únicos
        telefonos = db.query(Registro.telefono_wa).distinct().all()
        
        for telefono_tupla in telefonos:
            telefono = telefono_tupla[0]
            if not telefono:  # Saltar si el teléfono es None o vacío
                continue
                
            # Contar registros para este teléfono
            total = db.query(Registro).filter(Registro.telefono_wa == telefono).count()
            
            if total > umbral:
                # Obtener los IDs de los registros más recientes que queremos conservar
                ids_a_conservar = [
                    r[0] for r in db.query(Registro.id)
                    .filter(Registro.telefono_wa == telefono)
                    .order_by(Registro.id.desc())
                    .limit(dejar)
                    .all()
                ]
                
                # Eliminar los registros antiguos que no están en la lista de conservar
                if ids_a_conservar:
                    db.query(Registro).filter(
                        and_(
                            Registro.telefono_wa == telefono,
                            ~Registro.id.in_(ids_a_conservar)
                        )
                    ).delete(synchronize_session=False)
                    
                    db.commit()
                    print(f"Limpiados {total - dejar} registros antiguos para el teléfono: {telefono}")
    except Exception as e:
        db.rollback()
        print(f"Error al limpiar registros: {str(e)}")
        raise
    finally:
        db.close()
