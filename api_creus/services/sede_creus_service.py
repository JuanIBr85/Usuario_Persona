from models.sede_creus_model import SedeCreus
from models.estado_model import Estado
from models import db
from utils.response_utils import make_response, ResponseStatus
from utils.validation_utils import validar_fk_existente, validar_duplicado

class SedeCreusService:

    @staticmethod
    def get_all():
        sedes = SedeCreus.query.all()
        if not sedes:
            return (make_response(ResponseStatus.SUCCESS, "No hay sedes CREUS registradas", data=[]), 204,)
        data = [s.to_dict() for s in sedes]
        return (make_response(ResponseStatus.SUCCESS, "Lista de sedes obtenida con éxito", data), 200,)

    @staticmethod
    def get_by_id(id):
        sede = SedeCreus.query.get(id)
        if not sede:
            return (make_response(ResponseStatus.FAIL, f"No se encontró la sede con ID {id}", {"id": id}), 404,)
        return (make_response(ResponseStatus.SUCCESS, "Sede encontrada", sede.to_dict()), 200,)

    @staticmethod
    def create(data):
        errores = {}
        nombre = (data.get('nombre') or '').strip().title()

        # Validar duplicado
        error_dup = validar_duplicado(SedeCreus, SedeCreus.nombre, nombre)
        if error_dup:
            errores["nombre"] = error_dup

        # Validar FK id_estado
        error_fk = validar_fk_existente(Estado, data.get("id_estado"), "Estado")
        if error_fk:
            errores["id_estado"] = error_fk

        if errores:
            return (make_response(ResponseStatus.FAIL, "Errores de validación", errores), 400,)

        try:
            nueva = SedeCreus(
                nombre=nombre,
                email=(data.get('email') or '').strip().lower(),
                telefono=(data.get('telefono') or '').strip(),
                pagina_web=(data.get('pagina_web') or '').strip(),
                calle=(data.get('calle') or '').strip().title(),
                numero=(data.get('numero') or '').strip(),
                ciudad=(data.get('ciudad') or '').strip().title(),
                provincia=(data.get('provincia') or '').strip().title(),
                pais=(data.get('pais') or '').strip().title(),
                codigo_postal=(data.get('codigo_postal') or '').strip(),
                id_estado=data.get('id_estado'),
                observaciones=data.get('observaciones')
            )
            db.session.add(nueva)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Sede creada correctamente", {"id": nueva.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear la sede", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        sede = SedeCreus.query.get(id)
        if not sede:
            return (make_response(ResponseStatus.FAIL, "Sede no encontrada", {"id": id}), 404,)

        errores = {}
        nuevo_nombre = (data.get('nombre', sede.nombre) or '').strip().title()

        # Validar duplicado si cambia nombre
        if nuevo_nombre != sede.nombre:
            error_dup = validar_duplicado(SedeCreus, SedeCreus.nombre, nuevo_nombre, id_actual=id)
            if error_dup:
                errores["nombre"] = error_dup

        # Validar FK id_estado
        nuevo_estado = data.get("id_estado", sede.id_estado)
        error_fk = validar_fk_existente(Estado, nuevo_estado, "Estado")
        if error_fk:
            errores["id_estado"] = error_fk

        if errores:
            return (make_response(ResponseStatus.FAIL, "Errores de validación", errores), 400,)

        try:
            sede.nombre = nuevo_nombre
            sede.email = (data.get('email', sede.email) or '').strip().lower()
            sede.telefono = (data.get('telefono', sede.telefono) or '').strip()
            sede.pagina_web = (data.get('pagina_web', sede.pagina_web) or '').strip()
            sede.calle = (data.get('calle', sede.calle) or '').strip().title()
            sede.numero = (data.get('numero', sede.numero) or '').strip()
            sede.ciudad = (data.get('ciudad', sede.ciudad) or '').strip().title()
            sede.provincia = (data.get('provincia', sede.provincia) or '').strip().title()
            sede.pais = (data.get('pais', sede.pais) or '').strip().title()
            sede.codigo_postal = (data.get('codigo_postal', sede.codigo_postal) or '').strip()
            sede.id_estado = nuevo_estado
            sede.observaciones = data.get('observaciones', sede.observaciones)

            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Sede actualizada correctamente", {"id": sede.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar la sede", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        sede = SedeCreus.query.get(id)
        if not sede:
            return (make_response(ResponseStatus.FAIL, "Sede no encontrada", {"id": id}), 404,)
        if sede.id_estado == 2:
            return (make_response(ResponseStatus.FAIL, "La sede ya está inactiva", {"estado": "inactiva"}), 400,)

        try:
            sede.id_estado = 2
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Sede desactivada correctamente", {"id": sede.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al desactivar la sede", {"error": str(e)}), 500,)
        
    @staticmethod
    def get_all_by_estado(id_estado):
        sedes = SedeCreus.query.filter_by(id_estado=id_estado).all()
        if not sedes:
            estado_nombre = "activas" if id_estado == 1 else "inactivas"
            return (make_response(ResponseStatus.SUCCESS, f"No hay sedes {estado_nombre}", data=[]), 204,)
        data = [s.to_dict() for s in sedes]
        return (make_response(ResponseStatus.SUCCESS, "Lista de sedes obtenida con éxito", data), 200,)



