from models.coordinador_model import Coordinador
from models.estado_model import Estado
from models import db
from utils.response_utils import make_response, ResponseStatus
from utils.validation_utils import validar_fk_existente, validar_duplicado_coordinador


class CoordinadorService:

    @staticmethod
    def get_all():
        items = Coordinador.query.all()
        if not items:
            return (make_response(ResponseStatus.SUCCESS, "No hay coordinadores registrados", []), 204,)
        return (make_response(ResponseStatus.SUCCESS, "Lista de coordinadores", [c.to_dict() for c in items]), 200,)

    @staticmethod
    def get_by_id(id):
        item = Coordinador.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Coordinador no encontrado", {"id": id}), 404,)
        return (make_response(ResponseStatus.SUCCESS, "Coordinador encontrado", item.to_dict()), 200,)

    @staticmethod
    def create(data):
        errores = {}

        # Normalización de datos
        nombre = data.get("nombre", "").strip().title()
        apellido = data.get("apellido", "").strip().title()
        email = data.get("email", "").strip().lower()
        telefono = data.get("telefono", "").strip()

        # Validación de duplicados
        errores.update(validar_duplicado_coordinador(nombre, apellido, email, telefono))

        # Validar estado
        error_estado = validar_fk_existente(Estado, data.get("id_estado"), "Estado")
        if error_estado:
            errores["id_estado"] = error_estado

        if errores:
            return (make_response(ResponseStatus.FAIL, "Errores de validación", errores), 400,)

        try:
            nuevo = Coordinador(
                nombre=nombre,
                apellido=apellido,
                email=email,
                telefono=telefono,
                id_estado=data.get("id_estado"),
                observaciones=data.get("observaciones", "").strip()
            )
            db.session.add(nuevo)
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Coordinador creado correctamente", {"id": nuevo.id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al crear coordinador", {"error": str(e)}), 500,)

    @staticmethod
    def update(id, data):
        item = Coordinador.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Coordinador no encontrado", {"id": id}), 404,)

        errores = {}

        # Normalización de datos
        nuevo_nombre = data.get("nombre", item.nombre).strip().title()
        nuevo_apellido = data.get("apellido", item.apellido).strip().title()
        nuevo_email = data.get("email", item.email).strip().lower()
        nuevo_telefono = data.get("telefono", item.telefono).strip()

        # Validación de duplicados (exceptuando el actual)
        errores.update(validar_duplicado_coordinador(
            nuevo_nombre, nuevo_apellido, nuevo_email, nuevo_telefono, id_actual=id
        ))

        # Validar estado si se modifica
        id_estado = data.get("id_estado", item.id_estado)
        error_estado = validar_fk_existente(Estado, id_estado, "Estado")
        if error_estado:
            errores["id_estado"] = error_estado

        if errores:
            return (make_response(ResponseStatus.FAIL, "Errores de validación", errores), 400,)

        try:
            item.nombre = nuevo_nombre
            item.apellido = nuevo_apellido
            item.email = nuevo_email
            item.telefono = nuevo_telefono
            item.id_estado = id_estado
            item.observaciones = data.get("observaciones", "").strip()
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Coordinador actualizado", item.to_dict()), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al actualizar coordinador", {"error": str(e)}), 500,)

    @staticmethod
    def delete(id):
        item = Coordinador.query.get(id)
        if not item:
            return (make_response(ResponseStatus.FAIL, "Coordinador no encontrado", {"id": id}), 404,)

        if item.id_estado == 2:
            return (make_response(ResponseStatus.FAIL, "El coordinador ya está inactivo", {"estado": "inactivo"}), 400,)

        try:
            item.id_estado = 2
            db.session.commit()
            return (make_response(ResponseStatus.SUCCESS, "Coordinador desactivado", {"id": id}), 200,)
        except Exception as e:
            db.session.rollback()
            return (make_response(ResponseStatus.ERROR, "Error al desactivar", {"error": str(e)}), 500,)


