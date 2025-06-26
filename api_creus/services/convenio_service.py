from models.convenio_model import Convenio
from models import db
from utils.validation_utils import validar_duplicado, validar_fk_existente,validar_relacion_activa
from utils.response_utils import make_response, ResponseStatus
from models.estado_model import Estado
from models.institucion_model import Institucion
from models.archivo_model import Archivo
from models.propuesta_educativa_model import PropuestaEducativa

class ConvenioService:

    @staticmethod
    def get_all():
        items = Convenio.query.all()
        if not items:
            return make_response(ResponseStatus.SUCCESS, "No hay convenios disponibles", data=[])
        return make_response(ResponseStatus.SUCCESS, "Lista de convenios", [i.to_dict() for i in items])

    @staticmethod
    def get_by_id(id):
        item = Convenio.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Convenio no encontrado", {"id": id})
        return make_response(ResponseStatus.SUCCESS, "Convenio encontrado", item.to_dict())

    @staticmethod
    def create(data):
        errores = {}

        # Validaciones FK
        error_institucion = validar_fk_existente(Institucion, data.get("id_institucion"), "Institución")
        if error_institucion:
            errores["id_institucion"] = error_institucion

        error_estado = validar_fk_existente(Estado, data.get("id_estado"), "Estado")
        if error_estado:
            errores["id_estado"] = error_estado

        id_archivo = data.get("id_archivo")
        error_archivo = None
        if id_archivo is not None:
            error_archivo = validar_fk_existente(Archivo, id_archivo, "Archivo")
            if error_archivo:
                errores["id_archivo"] = error_archivo

        # Validación de nombre duplicado
        error_nombre = validar_duplicado(Convenio, Convenio.nombre, data['nombre'])
        if error_nombre:
            errores["nombre"] = error_nombre

        if errores:
            return make_response(ResponseStatus.FAIL, "Error de validación", errores)

        try:
            nuevo = Convenio(
                nombre=data['nombre'].strip().title(),
                descripcion=data['descripcion'],
                fecha_inicio=data['fecha_inicio'],
                fecha_fin=data['fecha_fin'],
                id_archivo=data.get('id_archivo'),
                id_institucion=data['id_institucion'],
                id_estado=data['id_estado'],
                observaciones=data.get('observaciones')
            )
            db.session.add(nuevo)
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Convenio creado correctamente", {"id": nuevo.id})
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al crear convenio", {"error": str(e)})
    
    @staticmethod
    def update(id, data):
        item = Convenio.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Convenio no encontrado", {"id": id})
        errores = {}
        nombre_formateado = data.get('nombre', item.nombre).strip().title() if data.get('nombre') else item.nombre

        # Validaciones FK
        error_institucion = validar_fk_existente(Institucion, data.get("id_institucion"), "Institución")
        if error_institucion:
            errores["id_institucion"] = error_institucion

        error_estado = validar_fk_existente(Estado, data.get("id_estado"), "Estado")
        if error_estado:
            errores["id_estado"] = error_estado

        id_archivo = data.get("id_archivo", item.id_archivo)
        if id_archivo is not None:
            error_archivo = validar_fk_existente(Archivo, id_archivo, "Archivo")
            if error_archivo:
                errores["id_archivo"] = error_archivo

        # Validar duplicados excepto actual
        if nombre_formateado != item.nombre:
            error_nombre = validar_duplicado(Convenio, Convenio.nombre, nombre_formateado, id_actual=id)
            if error_nombre:
                errores["nombre"] = error_nombre

        if errores:
            return make_response(ResponseStatus.FAIL, "Error de validación", errores)

        try:
            item.nombre = nombre_formateado
            item.descripcion = data.get('descripcion', item.descripcion)
            item.fecha_inicio = data.get('fecha_inicio', item.fecha_inicio)
            item.fecha_fin = data.get('fecha_fin', item.fecha_fin)
            item.id_archivo = id_archivo
            item.id_institucion = data.get('id_institucion', item.id_institucion)
            item.id_estado = data.get('id_estado', item.id_estado)
            item.observaciones = data.get('observaciones', item.observaciones)

            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Convenio actualizado correctamente", item.to_dict())
        except Exception as e:
            db.session.rollback()
            return make_response(ResponseStatus.ERROR, "Error al actualizar convenio", {"error": str(e)})

    @staticmethod
    def delete(id):
        item = Convenio.query.get(id)
        if not item:
            return make_response(ResponseStatus.FAIL, "Convenio no encontrado", {"id": id})
        
        if item.id_estado == 2:  # Si ya está eliminado
            return make_response(ResponseStatus.FAIL, "El convenio ya está oculto", {"id": id})

        error_uso = validar_relacion_activa(PropuestaEducativa, PropuestaEducativa.id_convenio,id, "No se puede ocultar el convenio porque está asociado a una propuesta educativa activa.")
        if error_uso:
            return make_response(ResponseStatus.FAIL, error_uso)
        
        try:
            item.id_estado = 2
            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Convenio ocultado correctamente", {"id": id})
        except Exception as e:
            return make_response(ResponseStatus.ERROR, "Error al eliminar convenio", {"error": str(e)})