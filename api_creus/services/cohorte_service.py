from datetime import datetime
from marshmallow import ValidationError
from utils.response_utils import make_response, ResponseStatus
from utils.validation_utils import validar_fk_existente, validar_fechas
from models import db
from models.cohorte_model import Cohorte
from models.propuesta_educativa_model import PropuestaEducativa
from models.estado_model import Estado
from models.coordinador_model import Coordinador
from models.sede_creus_model import SedeCreus

class CohorteService:

    @staticmethod
    def get_all():
        items = Cohorte.query.all()
        return make_response(
            ResponseStatus.SUCCESS,
            "Lista completa de cohortes" if items else "No hay cohortes registradas",
            [i.to_dict() for i in items]
        )

    @staticmethod
    def get_by_estado(estado_id):
        items = Cohorte.query.filter_by(id_estado=estado_id).all()
        label = "activas" if estado_id == 1 else "inactivas" if estado_id == 2 else "cohortes"
        mensaje = f"Lista de cohortes {label}" if items else f"No hay cohortes {label}"
        return make_response(ResponseStatus.SUCCESS, mensaje, [i.to_dict() for i in items])

    @staticmethod
    def get_by_id(id):
        item = Cohorte.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Cohorte no encontrada", {"id": id})
        return make_response(ResponseStatus.SUCCESS, "Cohorte encontrada", item.to_dict())

    @staticmethod
    def create(data):
        errores = {}

        # Helper: convertir string ISO a datetime
        def parse_fecha(fecha):
            return datetime.fromisoformat(fecha) if isinstance(fecha, str) else fecha

        # Validar claves foráneas
        for modelo, id_valor, campo in [
            (PropuestaEducativa, data.get("id_propuesta_educativa"), "Propuesta educativa"),
            (Estado, data.get("id_estado"), "Estado"),
            (Coordinador, data.get("id_coordinador"), "Coordinador"),
            (SedeCreus, data.get("id_sede_creus"), "Sede CREUS"),
        ]:
            error = validar_fk_existente(modelo, id_valor, campo)
            if error:
                errores[f"id_{campo.lower().replace(' ', '_')}"] = error

        # Validar cohorte duplicada para misma propuesta
        existente = Cohorte.query.filter_by(
            id_propuesta_educativa=data["id_propuesta_educativa"],
            numero_cohorte=data["numero_cohorte"]
        ).first()
        if existente:
            errores["numero_cohorte"] = "Ya existe una cohorte con ese número para esta propuesta"

        # Validación de fechas (orden lógico)
        try:
            validar_fechas(data["fecha_inicio_preinscripcion"], data["fecha_cierre_preinscripcion"])
        except ValidationError as e:
            errores["fecha_inicio_preinscripcion"] = str(e)

        try:
            validar_fechas(data["fecha_cierre_preinscripcion"], data["fecha_inicio_cursado"])
        except ValidationError as e:
            errores["fecha_inicio_cursado"] = str(e)

        try:
            validar_fechas(data["fecha_inicio_cursado"], data["fecha_estimada_finalizacion"])
        except ValidationError as e:
            errores["fecha_estimada_finalizacion"] = str(e)

        # Validación lógica de cupos
        if data["cupos_ocupados"] > data["cupos_maximos"]:
            errores["cupos_ocupados"] = "No puede superar los cupos máximos"

        # Validar que el año coincida con fecha_inicio_cursado
        fecha_cursado = parse_fecha(data["fecha_inicio_cursado"])
        if data["anio_inicio"] != fecha_cursado.year:
            errores["anio_inicio"] = "El año de inicio debe coincidir con el de la fecha de cursado"

        if errores:
            return make_response(ResponseStatus.FAIL, "Errores de validación", errores)

        try:
            nueva = Cohorte(**data)
            db.session.add(nueva)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Cohorte creada correctamente", {"id": nueva.id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear cohorte", {"error": str(e)})

    @staticmethod
    def update(id, data):
        item = Cohorte.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Cohorte no encontrada", {"id": id})

        errores = {}

        # Helper para convertir string a datetime si es necesario
        def parse_fecha(fecha):
            return datetime.fromisoformat(fecha) if isinstance(fecha, str) else fecha

        # Validar claves foráneas
        for modelo, id_valor, campo in [
            (PropuestaEducativa, data.get("id_propuesta_educativa"), "Propuesta educativa"),
            (Estado, data.get("id_estado"), "Estado"),
            (Coordinador, data.get("id_coordinador"), "Coordinador"),
            (SedeCreus, data.get("id_sede_creus"), "Sede CREUS"),
        ]:
            error = validar_fk_existente(modelo, id_valor, campo)
            if error:
                errores[f"id_{campo.lower().replace(' ', '_')}"] = error

        # Validar duplicado si cambia la combinación de propuesta y número cohorte
        existente = Cohorte.query.filter_by(
            id_propuesta_educativa=data["id_propuesta_educativa"],
            numero_cohorte=data["numero_cohorte"]
        ).first()
        if existente and existente.id != id:
            errores["numero_cohorte"] = "Ya existe una cohorte con ese número para esta propuesta"

        # Validación de fechas (orden lógico)
        try:
            validar_fechas(data["fecha_inicio_preinscripcion"], data["fecha_cierre_preinscripcion"])
        except ValidationError as e:
            errores["fecha_inicio_preinscripcion"] = str(e)

        try:
            validar_fechas(data["fecha_cierre_preinscripcion"], data["fecha_inicio_cursado"])
        except ValidationError as e:
            errores["fecha_inicio_cursado"] = str(e)

        try:
            validar_fechas(data["fecha_inicio_cursado"], data["fecha_estimada_finalizacion"])
        except ValidationError as e:
            errores["fecha_estimada_finalizacion"] = str(e)

        # Validar cupos
        if data["cupos_ocupados"] > data["cupos_maximos"]:
            errores["cupos_ocupados"] = "No hay cupos disponibles"

        # Validar año
        fecha_cursado = parse_fecha(data["fecha_inicio_cursado"])
        if data["anio_inicio"] != fecha_cursado.year:
            errores["anio_inicio"] = "El año de inicio debe coincidir con el de la fecha de cursado"

        if errores:
            return make_response(ResponseStatus.FAIL, "Errores de validación", errores)

        try:
            for campo, valor in data.items():
                setattr(item, campo, valor)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Cohorte actualizada correctamente", item.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar cohorte", {"error": str(e)})

    @staticmethod
    def delete(id):
        item = Cohorte.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Cohorte no encontrada", {"id": id})

        try:
            item.id_estado = 2  # Inactivo
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Cohorte inactivada correctamente", {"id": id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar cohorte", {"error": str(e)})
