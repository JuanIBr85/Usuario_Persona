from models import db
from models.propuesta_educativa_model import PropuestaEducativa
from models.modalidad_model import Modalidad
from models.convenio_model import Convenio
from models.tipo_propuesta_model import TipoPropuesta
from models.estado_model import Estado
from models.area_conocimiento_model import AreaConocimiento
from models.titulo_certificacion_model import TituloCertificacion
from utils.response_utils import make_response, ResponseStatus
from utils.validation_utils import validar_duplicado, validar_fk_existente

class PropuestaEducativaService:

    @staticmethod
    def get_all():
        items = PropuestaEducativa.query.all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, "No hay propuestas educativas disponibles", []), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Lista de propuestas educativas", [i.to_dict() for i in items]), 200,)

    @staticmethod
    def get_by_id(id):
        item = PropuestaEducativa.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Propuesta educativa no encontrada", {"id": id}), 404,)
        return (make_response(ResponseStatus.SUCCESS, "Propuesta educativa encontrada", item.to_dict()), 200,)
    
    @staticmethod
    def get_activas():
        items = PropuestaEducativa.query.filter_by(id_estado=1).all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, "No hay propuestas activas", []), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Lista de propuestas activas", [i.to_dict() for i in items]), 200,)

    @staticmethod
    def get_inactivas():
        items = PropuestaEducativa.query.filter_by(id_estado=2).all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, "No hay propuestas inactivas", []), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Lista de propuestas inactivas", [i.to_dict() for i in items]), 200,)


    @staticmethod
    def create(data):
        errores = {}

        # Validar duplicado
        nombre = data.get('nombre', '').strip().title()
        error_dup = validar_duplicado(PropuestaEducativa, PropuestaEducativa.nombre, nombre)
        if error_dup:
            errores["nombre"] = error_dup

        # Validar claves foráneas
        fks = [
            (Modalidad, data.get("id_modalidad"), "Modalidad"),
            (TipoPropuesta, data.get("id_tipo_propuesta"), "Tipo de propuesta"),
            (Estado, data.get("id_estado"), "Estado"),
            (AreaConocimiento, data.get("id_area_conocimiento"), "Área de conocimiento"),
            (TituloCertificacion, data.get("id_titulo_certificacion"), "Título de certificación")
        ]
        for modelo, id_valor, campo_nombre in fks:
            error = validar_fk_existente(modelo, id_valor, campo_nombre)
            if error:
                errores[f"id_{campo_nombre.lower().replace(' ', '_')}"] = error

        # Convenio es opcional
        if data.get("id_convenio") is not None:
            error_conv = validar_fk_existente(Convenio, data["id_convenio"], "Convenio")
            if error_conv:
                errores["id_convenio"] = error_conv

        if errores:
            return (make_response(ResponseStatus.FAIL, "Errores de validación", errores), 400,)

        try:
            nueva = PropuestaEducativa(
                nombre=nombre,
                descripcion=data.get("descripcion"),
                duracion=data.get("duracion"),
                titulo_otorgado=data.get("titulo_otorgado"),
                requisitos_ingreso=data.get("requisitos_ingreso"),
                perfil_egresado=data.get("perfil_egresado"),
                salida_laboral=data.get("salida_laboral"),
                observaciones=data.get("observaciones"),
                id_modalidad=data.get("id_modalidad"),
                id_convenio=data.get("id_convenio"),
                id_tipo_propuesta=data.get("id_tipo_propuesta"),
                id_estado=data.get("id_estado"),
                id_area_conocimiento=data.get("id_area_conocimiento"),
                id_titulo_certificacion=data.get("id_titulo_certificacion")
            )
            db.session.add(nueva)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Propuesta educativa creada correctamente", {"id": nueva.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear propuesta educativa", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        item = PropuestaEducativa.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Propuesta educativa no encontrada", {"id": id}), 404,)

        errores = {}

        nombre = data.get('nombre', item.nombre).strip().title()
        # Verificar duplicado (excluyendo a sí mismo)
        error_dup = validar_duplicado(PropuestaEducativa, PropuestaEducativa.nombre, nombre, id_actual=id)
        if error_dup:
            errores["nombre"] = error_dup

        # Validar claves foráneas
        fks = [
            (Modalidad, data.get("id_modalidad", item.id_modalidad), "Modalidad"),
            (TipoPropuesta, data.get("id_tipo_propuesta", item.id_tipo_propuesta), "Tipo de propuesta"),
            (Estado, data.get("id_estado", item.id_estado), "Estado"),
            (AreaConocimiento, data.get("id_area_conocimiento", item.id_area_conocimiento), "Área de conocimiento"),
            (TituloCertificacion, data.get("id_titulo_certificacion", item.id_titulo_certificacion), "Título de certificación")
        ]
        for modelo, id_valor, campo_nombre in fks:
            error = validar_fk_existente(modelo, id_valor, campo_nombre)
            if error:
                errores[f"id_{campo_nombre.lower().replace(' ', '_')}"] = error

        if data.get("id_convenio") is not None:
            error_conv = validar_fk_existente(Convenio, data["id_convenio"], "Convenio")
            if error_conv:
                errores["id_convenio"] = error_conv

        if errores:
            return (make_response(ResponseStatus.FAIL, "Errores de validación", errores), 400,)

        try:
            item.nombre = nombre
            item.descripcion = data.get("descripcion", item.descripcion)
            item.duracion = data.get("duracion", item.duracion)
            item.titulo_otorgado = data.get("titulo_otorgado", item.titulo_otorgado)
            item.requisitos_ingreso = data.get("requisitos_ingreso", item.requisitos_ingreso)
            item.perfil_egresado = data.get("perfil_egresado", item.perfil_egresado)
            item.salida_laboral = data.get("salida_laboral", item.salida_laboral)
            item.observaciones = data.get("observaciones", item.observaciones)
            item.id_modalidad = data.get("id_modalidad", item.id_modalidad)
            item.id_convenio = data.get("id_convenio", item.id_convenio)
            item.id_tipo_propuesta = data.get("id_tipo_propuesta", item.id_tipo_propuesta)
            item.id_estado = data.get("id_estado", item.id_estado)
            item.id_area_conocimiento = data.get("id_area_conocimiento", item.id_area_conocimiento)
            item.id_titulo_certificacion = data.get("id_titulo_certificacion", item.id_titulo_certificacion)

            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Propuesta educativa actualizada", item.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar la propuesta educativa", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        item = PropuestaEducativa.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Propuesta educativa no encontrada", {"id": id}), 404,)

        if item.id_estado == 2:
            return (make_response(ResponseStatus.FAIL, "La propuesta ya está inactiva", {"estado": "inactiva"}), 400,)

        try:
            item.id_estado = 2
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Propuesta educativa inactivada", {"id": id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al inactivar propuesta", {"error": str(e)}), 500,)