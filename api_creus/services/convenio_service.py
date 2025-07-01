from models import db
from models.convenio_model import Convenio
from utils.validation_utils import validar_duplicado
from utils.response_utils import make_response, ResponseStatus

class ConvenioService:

    @staticmethod
    def get_all():
        items = Convenio.query.all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, "No hay convenios registrados", data=[]), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Lista de convenios obtenida con éxito.", [i.to_dict() for i in items]), 200,)

    @staticmethod
    def get_by_id(id):
        item = Convenio.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Convenio no encontrado", {"id": id}), 404,)
        return (make_response(ResponseStatus.SUCCESS, "Convenio encontrado", item.to_dict()), 200,)

    @staticmethod
    def get_activos():
        items = Convenio.query.filter_by(id_estado=1).all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, "No hay convenios activos", data=[]), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Lista de convenios activos obtenida con éxito.", [i.to_dict() for i in items]), 200,)

    @staticmethod
    def create(data):
        nombre_formateado = data['nombre'].strip().title()
        error_dup = validar_duplicado(Convenio, Convenio.nombre, nombre_formateado)
        if error_dup:
            return (make_response(ResponseStatus.FAIL, "Duplicado", {"nombre": error_dup}), 400,)

        try:
            nuevo = Convenio(
                nombre=nombre_formateado,
                descripcion=data.get('descripcion'),
                fecha_inicio=data.get('fecha_inicio'),
                fecha_fin=data.get('fecha_fin'),
                id_archivo=data.get('id_archivo'),
                id_institucion=data.get('id_institucion'),
                id_estado=data.get('id_estado', 1),
                observaciones=data.get('observaciones', '')
            )
            db.session.add(nuevo)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Convenio creado correctamente", {"id": nuevo.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear el convenio", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        item = Convenio.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Convenio no encontrado", {"id": id}), 404,)

        nombre_formateado = data['nombre'].strip().title()
        error_dup = validar_duplicado(Convenio, Convenio.nombre, nombre_formateado, id_actual=id)
        if error_dup:
            return (make_response(ResponseStatus.FAIL, "Duplicado", {"nombre": error_dup}), 400,)

        try:
            item.nombre = nombre_formateado
            item.descripcion = data.get('descripcion', item.descripcion)
            item.fecha_inicio = data.get('fecha_inicio', item.fecha_inicio)
            item.fecha_fin = data.get('fecha_fin', item.fecha_fin)
            item.id_archivo = data.get('id_archivo', item.id_archivo)
            item.id_institucion = data.get('id_institucion', item.id_institucion)
            item.id_estado = data.get('id_estado', item.id_estado)
            item.observaciones = data.get('observaciones', item.observaciones)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Convenio actualizado correctamente", item.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar el convenio", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        item = Convenio.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Convenio no encontrado", {"id": id}), 404,)
        if item.id_estado == 2:
            return (make_response(ResponseStatus.FAIL, "El convenio ya está inactivo", {"estado": "Inactivo"}), 400,)
        try:
            item.id_estado = 2  # Borrado lógico (id_estado 2 es inactivo)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "El convenio fue ocultado correctamente", {"id": item.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al ocultar el convenio", {"error": str(e)}), 500,)