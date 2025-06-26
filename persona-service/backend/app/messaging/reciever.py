import logging
from flask import Flask
from common.decorators.receiver import receiver as reciever
from app.extensions import SessionLocal
from app.models.persona_model import Persona
from app.models.contacto_model import Contacto
from app.services.contacto_service import ContactoService
from app.services.domicilio_service import DomicilioService
from app.services.persona_extendida_service import PersonaExtendidaService

@reciever(channel="default")
def vincular_usuario_persona(message:dict,app:Flask)->None:
    """Vincula un usuario existente a una persona por email."""

    if message.get("event_type") != "auth_user_register":
        return
    
    data = message.get("message",{})
    id_usuario = data.get("id_usuario")
    email = data.get("email")

    if not id_usuario or not email:
        logging.warning(f"[PersonaService] Mensaje sin id_usuario o email")
        return
    
    session=SessionLocal()

    try:
        with app.app_context():
            persona=(
                session.query(Persona)
                .join(Contacto, Persona.contacto_id == Contacto.id_contacto)
                .filter(Contacto.email_contacto == email)
                .first()
            )

            if not persona:
                logging.warning(f"[PersonaService] No se encontró persona con email {email}")
                return
            
            if persona.usuario_id:
                logging.warning(f"[PersonaService] La persona {persona.id_persona} ya esta vinculada al usuario {persona.usuario_id}. Se debe registrar otro usuario con otro email.")
                return
            
            if persona.deleted_at is not None:
                persona.deleted_at = None
                if persona.contacto_id:
                    ContactoService().restaurar_contacto(persona.contacto_id, session)
                if persona.domicilio_id:
                    DomicilioService().restaurar_domicilio(persona.domicilio_id, session)
                if persona.extendida_id:
                    PersonaExtendidaService().restaurar_persona_extendida(persona.extendida_id, session)
                        
            persona.usuario_id = id_usuario
            session.commit()
            logging.info(f"[PersonaService] Persona {persona.id_persona} vinculada al usuario {id_usuario}")

    except Exception as e:
        session.rollback()
        logging.error(f"[PersonaService] Error al vincular persona: {e}")

    finally:
        session.close()

