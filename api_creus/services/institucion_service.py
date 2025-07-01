from models import db
from models.institucion_model import Institucion
from utils.validation_utils import validar_duplicado
from utils.response_utils import make_response, ResponseStatus

class InstitucionService:

    @staticmethod
    def get_all():
        items = Institucion.query.all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, "No hay instituciones registradas", data=[]), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Lista de instituciones obtenida con éxito.", [i.to_dict() for i in items]), 200,)

    @staticmethod
    def get_by_id(id):
        item = Institucion.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Institución no encontrada", {"id": id}), 404,)
        return (make_response(ResponseStatus.SUCCESS, "Institución encontrada", item.to_dict()), 200,)

    @staticmethod
    def get_activas():
        items = Institucion.query.filter_by(id_estado=1).all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, "No hay instituciones activas", data=[]), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Lista de instituciones activas obtenida con éxito.", [i.to_dict() for i in items]), 200,)

    @staticmethod
    def create(data):
        nombre_formateado = data['nombre'].strip().title()
        error_dup = validar_duplicado(Institucion, Institucion.nombre, nombre_formateado)
        if error_dup:
            return (make_response(ResponseStatus.FAIL, "Duplicado", {"nombre": error_dup}), 400,)

        try:
            nueva = Institucion(
                nombre=nombre_formateado,
                email=data.get('email'),
                telefono=data.get('telefono'),
                pagina_web=data.get('pagina_web'),
                calle=data.get('calle'),
                numero=data.get('numero'),
                ciudad=data.get('ciudad'),
                provincia=data.get('provincia'),
                pais=data.get('pais'),
                codigo_postal=data.get('codigo_postal', ''),
                id_estado=data.get('id_estado', 1),
                observaciones=data.get('observaciones', '')
            )
            db.session.add(nueva)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Institución creada correctamente", {"id": nueva.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear la institución", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        item = Institucion.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Institución no encontrada", {"id": id}), 404,)

        nombre_formateado = data['nombre'].strip().title()
        error_dup = validar_duplicado(Institucion, Institucion.nombre, nombre_formateado, id_actual=id)
        if error_dup:
            return (make_response(ResponseStatus.FAIL, "Duplicado", {"nombre": error_dup}), 400,)

        try:
            item.nombre = nombre_formateado
            item.email = data.get('email', item.email)
            item.telefono = data.get('telefono', item.telefono)
            item.pagina_web = data.get('pagina_web', item.pagina_web)
            item.calle = data.get('calle', item.calle)
            item.numero = data.get('numero', item.numero)
            item.ciudad = data.get('ciudad', item.ciudad)
            item.provincia = data.get('provincia', item.provincia)
            item.pais = data.get('pais', item.pais)
            item.codigo_postal = data.get('codigo_postal', item.codigo_postal)
            item.id_estado = data.get('id_estado', item.id_estado)
            item.observaciones = data.get('observaciones', item.observaciones)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Institución actualizada correctamente", item.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar la institución", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        item = Institucion.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Institución no encontrada", {"id": id}), 404,)
        if item.id_estado == 2:
            return (make_response(ResponseStatus.FAIL, "La institución ya está inactiva", {"estado": "Inactiva"}), 400,)
        try:
            item.id_estado = 2  # Borrado lógico (id_estado 2 es inactivo)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "La institución fue ocultada correctamente", {"id": item.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al ocultar la institución", {"error": str(e)}), 500,)
