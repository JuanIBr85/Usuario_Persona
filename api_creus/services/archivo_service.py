from models.archivo_model import Archivo
from models import db
from utils.response_utils import make_response, ResponseStatus
from models.propuesta_educativa_model import PropuestaEducativa

class ArchivoService:

    @staticmethod
    def get_all():
        items = Archivo.query.all()
        if not items:
            return make_response(ResponseStatus.SUCCESS, "No hay archivos disponibles", data=[])
        return make_response(ResponseStatus.SUCCESS, "Lista de archivos", [i.to_dict() for i in items])

    @staticmethod
    def get_by_id(id):
        item = Archivo.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Archivo no encontrado", {"id": id})
        return make_response(ResponseStatus.SUCCESS, "Archivo encontrado", item.to_dict())

    @staticmethod
    def get_by_propuesta_educativa(id_propuesta_educativa):
        # Obtiene todos los archivos asociados a una propuesta educativa específica
        items = Archivo.query.filter_by(id_propuesta_educativa=id_propuesta_educativa).all()
        if not items:
            return make_response(ResponseStatus.SUCCESS, "No hay archivos para esta propuesta educativa", data=[])
        return make_response(ResponseStatus.SUCCESS, "Archivos de la propuesta educativa", [i.to_dict() for i in items])

    @staticmethod
    def create(data):
        # Validar que existe la propuesta educativa
        propuesta = PropuestaEducativa.query.get(data['id_propuesta_educativa'])
        if not propuesta:
            return make_response(ResponseStatus.FAIL, "La propuesta educativa especificada no existe", {"id_propuesta_educativa": data['id_propuesta_educativa']})

        nombre_formateado = data['nombre'].strip()

        # Validar duplicado de nombre dentro de la misma propuesta educativa
        archivo_existente = Archivo.query.filter_by(
            nombre=nombre_formateado,
            id_propuesta_educativa=data['id_propuesta_educativa']
        ).first()
        
        if archivo_existente:
            return make_response(ResponseStatus.FAIL, "Ya existe un archivo con ese nombre en esta propuesta educativa", {"nombre": nombre_formateado})

        try:
            nuevo = Archivo(
                nombre=nombre_formateado,
                url_archivo=data['url_archivo'].strip(),
                id_propuesta_educativa=data['id_propuesta_educativa'],
                observaciones=data.get('observaciones')
            )
            db.session.add(nuevo)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Archivo creado correctamente", {"id": nuevo.id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear archivo", {"error": str(e)})

    @staticmethod
    def update(id, data):
        item = Archivo.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Archivo no encontrado", {"id": id})

        # Si se va a cambiar la propuesta educativa, validar que existe
        if 'id_propuesta_educativa' in data:
            propuesta = PropuestaEducativa.query.get(data['id_propuesta_educativa'])
            if not propuesta:
                return make_response(ResponseStatus.FAIL, "La propuesta educativa especificada no existe", {"id_propuesta_educativa": data['id_propuesta_educativa']})

        # Si se va a cambiar el nombre, validar duplicado
        if 'nombre' in data:
            nombre_formateado = data['nombre'].strip()
            id_propuesta = data.get('id_propuesta_educativa', item.id_propuesta_educativa)
            
            archivo_existente = Archivo.query.filter_by(
                nombre=nombre_formateado,
                id_propuesta_educativa=id_propuesta
            ).filter(Archivo.id != id).first()
            
            if archivo_existente:
                return make_response(ResponseStatus.FAIL, "Ya existe un archivo con ese nombre en esta propuesta educativa", {"nombre": nombre_formateado})

        try:
            if 'nombre' in data:
                item.nombre = data['nombre'].strip()
            if 'url_archivo' in data:
                item.url_archivo = data['url_archivo'].strip()
            if 'id_propuesta_educativa' in data:
                item.id_propuesta_educativa = data['id_propuesta_educativa']
            if 'observaciones' in data:
                item.observaciones = data.get('observaciones')
            
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Archivo actualizado correctamente", item.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar archivo", {"error": str(e)})

    @staticmethod
    def delete(id):
        item = Archivo.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Archivo no encontrado", {"id": id})

        try:
            db.session.delete(item)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Archivo eliminado correctamente", {"id": id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al eliminar archivo", {"error": str(e)})