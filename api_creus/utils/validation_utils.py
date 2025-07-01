from datetime import datetime
from models.coordinador_model import Coordinador
from marshmallow import ValidationError, pre_load, Schema

# Valida si un valor de clave foránea (ID) existe en la tabla referenciada
def validar_fk_existente(modelo, id_valor, campo_nombre):
    if id_valor is not None and not modelo.query.get(id_valor):
        return f"{campo_nombre} con ID {id_valor} no existe"
    return None

# Valida duplicado de nombres
def validar_duplicado(modelo, campo, valor, id_actual=None):
    query = modelo.query.filter(campo == valor)
    if id_actual:
        query = query.filter(modelo.id != id_actual)
    if query.first():
        return f"Ya existe un registro con {campo.name} = {valor}"
    return None

# Chequea que los campos no esten llenos de espacios
def not_blank(value):  
    if not value or not value.strip():
        raise ValidationError(
            "El campo no puede estar vacío o contener solo espacios.")

# Saca espacios si hay al inicio o final
class SacaEspacios:  
    @pre_load
    def strip_strings(self, data, **kwargs):
        for key, value in data.items():
            if isinstance(value, str):
                data[key] = value.strip()
        return data


# valida una relación para no eliminar el registro completo
def validar_relacion_activa(modelo_referencia, campo_fk, id_valor, mensaje=None):
    if modelo_referencia.query.filter(campo_fk == id_valor).first():
        return mensaje or "El registro está asociado a otra entidad y no puede eliminarse"
    return None

# Validación de fechas (fecha_inicio < fecha_fin)
def validar_fechas(fecha_inicio, fecha_fin):
    if fecha_inicio and fecha_fin:
        # Asegurarse que los objetos sean datetime o str parseable a datetime
        if isinstance(fecha_inicio, str):
            fecha_inicio = datetime.fromisoformat(fecha_inicio)
        if isinstance(fecha_fin, str):
            fecha_fin = datetime.fromisoformat(fecha_fin)
        if fecha_fin < fecha_inicio:
            raise ValidationError(
                "La fecha de fin no puede ser anterior a la fecha de inicio")

# Valida ordenamiento
def validar_ordenamiento(model, sort_by, sort_order='asc'):
    if not hasattr(model, sort_by):
        return None, f"Campo '{sort_by}' no válido para ordenamiento"

    if sort_order not in ['asc', 'desc']:
        return None, f"Orden '{sort_order}' no válido. Usar 'asc' o 'desc'"

    columna = getattr(model, sort_by)
    return (columna.desc() if sort_order == 'desc' else columna.asc()), None

# Valida duplicado de coordinador por nombre y apellido, email y teléfono
def validar_duplicado_coordinador(nombre, apellido, email, telefono, id_actual=None):
    errores = {}

    # Validar duplicado por nombre y apellido
    query_nombre = Coordinador.query.filter_by(nombre=nombre, apellido=apellido)
    if id_actual:
        query_nombre = query_nombre.filter(Coordinador.id != id_actual)
    if query_nombre.first():
        errores["nombre_completo"] = "Ya existe un coordinador con ese nombre y apellido"

    # Validar duplicado por email
    query_email = Coordinador.query.filter(Coordinador.email == email)
    if id_actual:
        query_email = query_email.filter(Coordinador.id != id_actual)
    if query_email.first():
        errores["email"] = "Ya existe un coordinador con ese email"

    # Validar duplicado por teléfono
    query_telefono = Coordinador.query.filter(Coordinador.telefono == telefono)
    if id_actual:
        query_telefono = query_telefono.filter(Coordinador.id != id_actual)
    if query_telefono.first():
        errores["telefono"] = "Ya existe un coordinador con ese teléfono"

    return errores
