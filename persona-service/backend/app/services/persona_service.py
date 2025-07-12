from datetime import date, datetime, timezone, timedelta
from flask import jsonify
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError
from sqlalchemy import and_, func, extract
from config import DIAS_RESTRICCION_MODIFICACION

# Se importan los modelos
from app.models.persona_model import Persona
from app.models.persona_extendida_model import PersonaExtendida

# Se importan los servicios
from app.services.contacto_service import ContactoService
from app.services.domicilio_service import DomicilioService
from app.services.persona_extendida_service import PersonaExtendidaService
from app.services.otp_service import OtpService


# Otras importaciones
from app.schema.persona_schema import PersonaSchema, PersonaResumidaSchema
from app.interfaces.persona_interface import IPersonaInterface
from app.extensions import SessionLocal
from app.utils.documentos_utils import validar_documento_por_tipo
from app.utils.email_util import enviar_notificacion_verificacion_admin
from app.schema.persona_extendida_schema import PersonaExtendidaSchema


class PersonaService(IPersonaInterface):

    def __init__(self):
        self.schema = PersonaSchema()
        self.varios_schemas = PersonaResumidaSchema(many=True)
        self.contacto_service = ContactoService()
        self.domicilio_service = DomicilioService()
        self.persona_ext_service = PersonaExtendidaService()
        self.otp_service = OtpService()

    def listar_personas(self):
        session = SessionLocal()
        try:
            personas = session.query(Persona).filter(
                Persona.deleted_at.is_(None)).all()
            return self.varios_schemas.dump(personas)
        finally:
            session.close()

    def listar_persona_id(self, id):
        session = SessionLocal()
        try:
            persona = (
                session.query(Persona)
                .filter(Persona.id_persona == id, Persona.deleted_at.is_(None))
                .first()
            )

            if not persona:
                return None
            return self.schema.dump(persona)
        finally:
            session.close()

    def listar_persona_usuario_id(self, id):
        session = SessionLocal()
        try:
            persona = (
                session.query(Persona)
                .filter(Persona.usuario_id == id, Persona.deleted_at.is_(None))
                .first()
            )

            if not persona:
                return None
            return self.schema.dump(persona)
        finally:
            session.close()

    def crear_persona(self, data):
        session = SessionLocal()

        try:
            if not data:
                return jsonify({"error": "No hay datos"}), 400

            data_validada = self.schema.load(data)

            tipo_doc = data_validada["tipo_documento"]
            num_doc = data_validada["num_doc_persona"]

            validacion = validar_documento_por_tipo(tipo_doc, num_doc)

            if validacion==0:
                raise Exception ("Numero de CUIL/CUIT invalido.")

            if not validacion:
                raise Exception ("Numero de documento invalido para el tipo selecionado. Verifique y vuelva a intentar.")    

            existe_persona = (
                session.query(Persona)
                .filter(
                    Persona.tipo_documento == data_validada["tipo_documento"],
                    Persona.num_doc_persona == data_validada["num_doc_persona"],
                    Persona.deleted_at.is_(None)
                )
                .first()
            )

            if existe_persona:
                raise Exception(
                    "La persona ya se encuentra registrada con ese tipo y numero de documento")

            # Se crea el contacto, domicilio
            domicilio = self.domicilio_service.crear_domicilio(
                data_validada.pop("domicilio"), session=session
            )
            contacto = self.contacto_service.crear_contacto(
                data_validada.pop("contacto"), session=session
            )

            extendida = data_validada.pop("persona_extendida", {})
            persona_extendida = self.persona_ext_service.crear_persona_extendida(
                extendida, session=session
            )

            data_validada["domicilio_id"] = domicilio.id_domicilio
            data_validada["contacto_id"] = contacto.id_contacto
            data_validada["extendida_id"] = persona_extendida.id_extendida
            data_validada["tipo_documento"] = data_validada.pop(
                "tipo_documento")

            if "usuario_id" in data_validada:
                nuevo_usuario_id = data_validada["usuario_id"]
                if nuevo_usuario_id == -1 or nuevo_usuario_id is None:
                    data_validada["usuario_id"] = None

            # Crear Persona
            persona_nueva = Persona(**data_validada)
            session.add(persona_nueva)
            session.commit()
            session.refresh(persona_nueva)

            return persona_nueva

        except Exception as e:
            session.rollback()

            if "UNIQUE constraint failed: personas.usuario_id" in str(e):
                raise Exception(
                    "Usuario ya tiene una persona asociada, no se puede crear más de un perfil de persona por usuario"
                )

            raise e

        finally:
            session.close()

    def modificar_persona(self, id, data):
        session = SessionLocal()

        try:
            persona = (
                session.query(Persona)
                .filter(Persona.id_persona == id, Persona.deleted_at.is_(None))
                .first()
            )

            if not persona:
                return None

            data_validada = self.schema.load(
                data, partial=True
            )  # permite que la modificacion sea parcial o total

            tipo_doc = data_validada.get("tipo_documento", persona.tipo_documento)
            num_doc = data_validada.get("num_doc_persona", persona.num_doc_persona)
            
            validacion = validar_documento_por_tipo(tipo_doc, num_doc)

            if validacion==0:
                raise Exception ("Numero de CUIL/CUIT invalido.")

            if not validacion:
                raise Exception ("Numero de documento invalido para el tipo selecionado. Verifique y vuelva a intentar.") 

            existe_persona = (
                session.query(Persona)
                .filter(
                    Persona.tipo_documento == tipo_doc,
                    Persona.num_doc_persona == num_doc,
                    Persona.deleted_at.is_(None),
                    Persona.id_persona != id,
                )
                .first()
            )

            if existe_persona:
                raise Exception(
                    "Hay una persona que se encuentra registrada con ese tipo y numero de documento. Por favor, intente nuevamente o comuniquese con un administrador"
                )               

            hubo_cambios = False
            hubo_cambios_persona = False


            if "domicilio" in data:
                actualizado = self.domicilio_service.modificar_domicilio(
                    persona.domicilio_id, 
                    data["domicilio"], 
                    session
                )

                if actualizado:
                    hubo_cambios = True

            if "contacto" in data:
                actualizado = self.contacto_service.modificar_contacto(
                    persona.contacto_id, 
                    data["contacto"], 
                    session
                )

                if actualizado:
                    hubo_cambios = True

            if "persona_extendida" in data:
                if persona.persona_extendida:
                    actualizado = self.persona_ext_service.modificar_persona_extendida(
                        persona.extendida_id, 
                        data["persona_extendida"], 
                        session
                    )
                    
                    if actualizado:
                        hubo_cambios = True

            for field in [
                "nombre_persona",
                "apellido_persona",
                "fecha_nacimiento_persona",
                "num_doc_persona",
                "tipo_documento",
            ]:
                if field in data_validada:
                    nuevo_valor = data_validada[field]
                    valor_actual = getattr(persona, field)

                    if nuevo_valor != valor_actual:
                        setattr(persona, field, nuevo_valor)
                        hubo_cambios_persona = True

            if "usuario_id" in data_validada:
                nuevo_usuario_id = data_validada["usuario_id"]
                if nuevo_usuario_id == -1 or nuevo_usuario_id is None:
                    # Para desvincular usuario
                    if persona.usuario_id is not None:
                        persona.usuario_id = None
                        hubo_cambios_persona = True
                elif nuevo_usuario_id != persona.usuario_id:
                     # Verificar que ese usuario no tiene ya otra persona vinculada
                    existe = session.query(Persona).filter(
                        Persona.usuario_id == nuevo_usuario_id,
                        Persona.deleted_at.is_(None),
                        Persona.id_persona != id
                    ).first()
                    if existe:
                        raise Exception(
                            "Ese usuario ya está asociado a otra persona")
                    persona.usuario_id = nuevo_usuario_id
                    hubo_cambios_persona = True
            # --- FIN AGREGADO ---

            if hubo_cambios_persona:
                persona.updated_at = datetime.now(timezone.utc)

            if hubo_cambios or hubo_cambios_persona:
                session.commit()
            else:
                session.flush()    

            return self.schema.dump(persona)

        except Exception as e:
            import traceback

            print("Error al modificar persona:")
            print(traceback.format_exc())
            session.rollback()
            raise e

        finally:
            session.close()

    def modificar_persona_restringido(self, id, data):
        session = SessionLocal()

        try:
            persona = (
                session.query(Persona)
                .filter(Persona.id_persona == id, Persona.deleted_at.is_(None))
                .first()
            )

            if not persona:
                return None

            data_validada = self.schema.load(data, partial=True)

            hubo_cambios_relacionados = False
            hubo_cambios_persona = False

            # Modificar entidades relacionadas
            if 'domicilio' in data:
                actualizado = self.domicilio_service.modificar_domicilio(
                    persona.domicilio_id, 
                    data['domicilio'], 
                    session
                )
               
                if actualizado:
                    hubo_cambios_relacionados = True              

            if 'contacto' in data:
                actualizado = self.contacto_service.modificar_contacto(
                    persona.contacto_id, 
                    data['contacto'], 
                    session
                    )
                if actualizado:
                    hubo_cambios_relacionados = True

            if 'persona_extendida' in data:
                if persona.persona_extendida:
                    actualizado = self.persona_ext_service.modificar_persona_extendida(
                        persona.extendida_id, 
                        data['persona_extendida'], 
                        session
                        )
                    if actualizado:
                        hubo_cambios_relacionados = True

            # Permiten cambios cada 30 días
            campos_modificables_cada_30_dias = [
                'nombre_persona', 
                'apellido_persona'
                ]

            # No deberían cambiarse automáticamente
            campos_no_modificables = [
                'fecha_nacimiento_persona', 
                'num_doc_persona', 
                'tipo_documento'
                ]

            ahora = datetime.now(timezone.utc)
            dias_restriccion = DIAS_RESTRICCION_MODIFICACION

            # Campos no modificables por el usuario
            for campo in campos_no_modificables:
                if campo in data_validada:
                    valor_actual = getattr(persona, campo)
                    nuevo_valor = data_validada[campo]

                    if str(nuevo_valor).strip() != str(valor_actual).strip():
                        raise Exception(
                            f"El campo '{campo}' no puede modificarse directamente. Contacte al administrador.")

            # Campos editables con restriccion temporal
            evaluar_restriccion = False
            cambios_realizados = []

            for campo in campos_modificables_cada_30_dias:
                if campo in data_validada:
                    actual = getattr(persona, campo)
                    nuevo = data_validada[campo]
                    if str(nuevo).strip() != str(actual).strip():
                        evaluar_restriccion = True
                        cambios_realizados.append(campo)

            if evaluar_restriccion:
                ultima_modificacion = persona.updated_at

                if not ultima_modificacion:
                    ultima_modificacion = ahora - timedelta(days=31)
                elif ultima_modificacion.tzinfo is None:
                    ultima_modificacion = ultima_modificacion.replace(
                        tzinfo=timezone.utc)

                dias = (ahora - ultima_modificacion).days

                #evaluar_restriccion = False

                if dias < dias_restriccion:
                    raise Exception(
                        f"Los campos Nombre y Apellido solo pueden modificarse cada {dias_restriccion} días. Si es necesario contacte a un administrador. "
                        f"Última modificación: {ultima_modificacion.date()}"
                    )
                 # Aplica las modificaciones
                 
            #hubo_cambios_persona = False
            
            for campo in cambios_realizados:
                setattr(persona, campo, data_validada[campo])
                hubo_cambios_persona = True

            if hubo_cambios_persona:
                persona.updated_at = ahora

            if hubo_cambios_relacionados or hubo_cambios_persona:    
                session.commit()
            else:
                session.flush()

            return self.schema.dump(persona)

        except Exception as e:
            import traceback

            print("Error al modificar persona:")
            print(traceback.format_exc())
            session.rollback()
            raise e

        finally:
            session.close()

    def borrar_persona(self, id_persona):
        session = SessionLocal()

        try:
            persona = (
                session.query(Persona)
                .filter(
                    and_(Persona.id_persona == id_persona,
                         Persona.deleted_at.is_(None))
                )
                .first()
            )

            if not persona:
                return None

            if persona.usuario_id:
                raise Exception(
                    "No se puede borrar la persona porque está vinculada a un usuario"
                )
            if persona.contacto_id:
                self.contacto_service.borrar_contacto(
                    persona.contacto_id, session)
            if persona.domicilio_id:
                self.domicilio_service.borrar_domicilio(
                    persona.domicilio_id, session)

            if persona.extendida_id:
                self.persona_ext_service.borrar_persona_extendida(
                    persona.extendida_id, session
                )

            persona.deleted_at = datetime.now(timezone.utc)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            raise e

        finally:
            session.close()

    def restaurar_persona(self, id):
        session = SessionLocal()

        try:
            persona = session.query(Persona).get(id)

            if not persona:
                return None

            if persona.deleted_at is None:
                return False

            persona.deleted_at = None

            if persona.contacto_id:
                self.contacto_service.restaurar_contacto(
                    persona.contacto_id, session)
            if persona.domicilio_id:
                self.domicilio_service.restaurar_domicilio(
                    persona.domicilio_id, session)
            if persona.extendida_id:
                self.persona_ext_service.restaurar_persona_extendida(
                    persona.extendida_id, session)

            session.commit()
            return True

        except Exception as e:
            session.rollback()
            raise e

        finally:
            session.close()

    def contar_personas(self):
        session = SessionLocal()
        try:
            # Personas por mes
            resultados = (
                session.query(
                    extract("year", Persona.created_at).label("year"),
                    extract("month", Persona.created_at).label("month"),
                    func.count(Persona.id_persona).label("total"),
                )
                .filter(Persona.deleted_at.is_(None))
                .group_by("year", "month")
                .order_by("year", "month")
                .all()
            )
            personas_por_mes = [
                {"year": r.year, "month": int(r.month), "total": r.total}
                for r in resultados
            ]

            # Totales generales
            total_activas = session.query(Persona).filter(Persona.deleted_at.is_(None)).count()
            total_inactivas = session.query(Persona).filter(Persona.deleted_at.isnot(None)).count()
            total_vinculadas = session.query(Persona).filter(Persona.usuario_id.isnot(None), Persona.deleted_at.is_(None)).count()
            total_no_vinculadas = session.query(Persona).filter(Persona.usuario_id.is_(None), Persona.deleted_at.is_(None)).count()
            total_personas = total_activas + total_inactivas

            # Altas por día y por semana (últimos 30 días)
            hoy = datetime.now().date()
            altas_dia = session.query(
                func.date(Persona.created_at),
                func.count(Persona.id_persona)
            ).filter(
                Persona.deleted_at.is_(None),
                Persona.created_at >= hoy - timedelta(days=30)
            ).group_by(
                func.date(Persona.created_at)
            ).order_by(
                func.date(Persona.created_at)
            ).all()
            personas_por_dia = [
                {"fecha": str(fecha), "total": total} for fecha, total in altas_dia
            ]

            # Personas creadas hoy, este mes, este año
            total_hoy = session.query(Persona).filter(
                Persona.deleted_at.is_(None),
                func.date(Persona.created_at) == hoy
            ).count()
            ahora = datetime.now()
            total_este_mes = session.query(Persona).filter(
                Persona.deleted_at.is_(None),
                extract("year", Persona.created_at) == ahora.year,
                extract("month", Persona.created_at) == ahora.month
            ).count()
            total_este_anio = session.query(Persona).filter(
                Persona.deleted_at.is_(None),
                extract("year", Persona.created_at) == ahora.year
            ).count()

            return {
                "total_personas": total_personas,
                "total_activas": total_activas,
                "total_inactivas": total_inactivas,
                "total_vinculadas": total_vinculadas,
                "total_no_vinculadas": total_no_vinculadas,
                "personas_creadas_hoy": total_hoy,
                "personas_creadas_este_mes": total_este_mes,
                "personas_creadas_este_anio": total_este_anio,
                "personas_por_dia_ultimos_30": personas_por_dia,
                "personas_por_mes": personas_por_mes,
            }
        finally:
            session.close()

    # VERIFICACION DE PERSONA CON DOCUMENTO
    def verificar_documento_mas_get_id(self, tipo_documento: str, num_doc_persona: str):
        session = SessionLocal()
        try:
            persona = (
                session.query(Persona)
                .filter(
                    Persona.tipo_documento == tipo_documento,
                    Persona.num_doc_persona == num_doc_persona,
                    Persona.deleted_at.is_(None),
                    Persona.usuario_id.is_(None),
                )
                .first()
            )
            if not persona:
                return False, None, None
            return True, persona.contacto.email_contacto, persona.id_persona
        finally:
            session.close()

    def enviar_otp(self, usuario_id: int, persona_id: int) -> str:
        session = SessionLocal()
        try:
            persona = session.query(Persona).get(persona_id)
            codigo = self.otp_service.solicitar_otp(persona)
            token = create_access_token(
                identity=usuario_id,
                additional_claims={"persona_id": persona_id, "otp": codigo},
                expires_delta=timedelta(minutes=15),
            )
            return token
        finally:
            session.close()
        raise Exception("Persona no encontrada")

    def vincular_persona(self, usuario_id: int, persona_id: int):
        session = SessionLocal()
        try:
            session.query(Persona).filter_by(id_persona=persona_id).update(
                {"usuario_id": usuario_id}
            )  # asocia la persona al usuario
            session.commit()  # guarda los cambios en la base de datos
        finally:
            session.close()


    #VERIFICACION DE DATOS PERSONALES PARA VINCULACION DE USUARIO Y PERSONA
    def verificar_datos_personales(
        self,
        datos_usuario: dict
    ) -> dict:

        nombre, apellido, fecha_nac, telefono, tipo_doc, num_doc, email = (
            datos_usuario['nombre_persona'],
            datos_usuario['apellido_persona'],
            datos_usuario['fecha_nacimiento_persona'],
            datos_usuario['telefono_movil'],
            datos_usuario['tipo_documento'],
            datos_usuario['num_doc_persona'],
            datos_usuario['usuario_email']
        )

        #recibe id_persona que ya estaba localizada, para no volver a verificar el documento
        session = SessionLocal()
        try:
            persona = (
                session.query(Persona)
                .filter(
                    Persona.tipo_documento == tipo_doc,
                    Persona.num_doc_persona == num_doc,
                    Persona.usuario_id.is_(None),
                )
                .first()
            )
            
            if not persona:
                return {
                    "encontrada": False,
                    "coinciden": False,
                    "mensaje": "No existe una persona con este identificador."
                }
            
            fecha_nac_dt = fecha_nac

            if fecha_nac_dt > date.today():
                return {
                    "encontrada": True,
                    "coinciden": False,
                    "mensaje": "La fecha de nacimiento no puede ser futura."
                }

            coinciden = (
                persona.nombre_persona.strip().lower() == nombre.strip().lower()
                and persona.apellido_persona.strip().lower() == apellido.strip().lower()
                and persona.fecha_nacimiento_persona == fecha_nac_dt
                #and persona.contacto.telefono_movil.strip() == telefono.strip()
            )

            # Enviar notificación al administrador
            enviar_notificacion_verificacion_admin(persona, datos_usuario, coinciden)

            mensaje = ("Tus datos concuerdan, se enviara la informacion al administrador para continuar con la vinculación."
                    if coinciden
                    else "Los datos proporcionados no coinciden. Contacta al administrador para continuar la verificación.")
            return {
                "encontrada": True,
                "coinciden": coinciden,
                "mensaje": mensaje        
            }

        finally:
            session.close()