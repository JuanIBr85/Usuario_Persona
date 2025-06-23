from models.propuesta_educativa_model import PropuestaEducativa
from models import db
from utils.response_utils import (
    success_object,
    success_list,
    success_empty,
    success_created,
    error_response
)

class PropuestaEducativaService:

    @staticmethod
    def get_all():
        propuestas = PropuestaEducativa.query.all()

        if not propuestas:
            return success_empty("No hay propuestas educativas disponibles")

        data = [p.to_dict() for p in propuestas]
        return success_list(data, "Lista de propuestas educativas obtenida")

    @staticmethod
    def get_by_id(id):
        propuesta = PropuestaEducativa.query.get(id)

        if not propuesta:
            return error_response("No se encontró la propuesta educativa", {"id": f"{id}"}, 404)

        return success_object(propuesta.to_dict(), "Propuesta educativa encontrada")

    @staticmethod
    def create(data):
        try:
            nueva = PropuestaEducativa(
                nombre=data.get('nombre', '').title(),
                descripcion=data.get('descripcion'),
                duracion=data.get('duracion'),
                titulo_otorgado=data.get('titulo_otorgado'),
                requisitos_ingreso=data.get('requisitos_ingreso'),
                perfil_egresado=data.get('perfil_egresado'),
                salida_laboral=data.get('salida_laboral'),
                observaciones=data.get('observaciones'),
                id_modalidad=data.get('id_modalidad'),
                id_convenio=data.get('id_convenio'),
                id_tipo_propuesta=data.get('id_tipo_propuesta'),
                id_estado=data.get('id_estado'),
                id_area_conocimiento=data.get('id_area_conocimiento'),
                id_titulo_certificacion=data.get('id_titulo_certificacion'),
            )

            db.session.add(nueva)
            db.session.commit()
            return success_created(nueva.id, "Propuesta educativa creada correctamente")

        except Exception as e:
            return error_response("Error al crear la propuesta educativa", {"detalle": str(e)}, 500)

    @staticmethod
    def update(id, data):
        propuesta = PropuestaEducativa.query.get(id)

        if not propuesta:
            return error_response("No se encontró la propuesta educativa", {"id": f"{id}"}, 404)

        try:
            propuesta.nombre = data.get('nombre', propuesta.nombre).title()
            propuesta.descripcion = data.get('descripcion', propuesta.descripcion)
            propuesta.duracion = data.get('duracion', propuesta.duracion)
            propuesta.titulo_otorgado = data.get('titulo_otorgado', propuesta.titulo_otorgado)
            propuesta.requisitos_ingreso = data.get('requisitos_ingreso', propuesta.requisitos_ingreso)
            propuesta.perfil_egresado = data.get('perfil_egresado', propuesta.perfil_egresado)
            propuesta.salida_laboral = data.get('salida_laboral', propuesta.salida_laboral)
            propuesta.observaciones = data.get('observaciones', propuesta.observaciones)
            propuesta.id_modalidad = data.get('id_modalidad', propuesta.id_modalidad)
            propuesta.id_convenio = data.get('id_convenio', propuesta.id_convenio)
            propuesta.id_tipo_propuesta = data.get('id_tipo_propuesta', propuesta.id_tipo_propuesta)
            propuesta.id_estado = data.get('id_estado', propuesta.id_estado)
            propuesta.id_area_conocimiento = data.get('id_area_conocimiento', propuesta.id_area_conocimiento)
            propuesta.id_titulo_certificacion = data.get('id_titulo_certificacion', propuesta.id_titulo_certificacion)

            db.session.commit()
            return success_object({"id": propuesta.id}, "Propuesta educativa actualizada correctamente")

        except Exception as e:
            return error_response("Error al actualizar la propuesta educativa", {"detalle": str(e)}, 500)

    @staticmethod
    def delete(id):
        propuesta = PropuestaEducativa.query.get(id)

        if not propuesta:
            return error_response("No se encontró la propuesta educativa", {"id": f"{id}"}, 404)

        if propuesta.id_estado == 2:
            return error_response("La propuesta ya está inactiva", {"estado": "Inactiva"}, 400)

        try:
            propuesta.id_estado = 2
            db.session.commit()
            return success_object({"id": propuesta.id}, "Propuesta educativa ocultada correctamente")
        except Exception as e:
            return error_response("Error al ocultar la propuesta educativa", {"detalle": str(e)}, 500)