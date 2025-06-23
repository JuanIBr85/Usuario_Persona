from marshmallow import ValidationError,pre_load

def validar_fk_existente(modelo, id_valor, campo_nombre):
    if id_valor is not None and not modelo.query.get(id_valor):
        return f"{campo_nombre} con ID {id_valor} no existe"
    return None

def validar_duplicado(modelo, campo, valor, id_actual=None):
    query = modelo.query.filter(campo == valor)
    if id_actual:
        query = query.filter(modelo.id != id_actual)
    if query.first():
        return f"Ya existe un registro con {campo.name} = {valor}"
    return None

def not_blank(value): #chequea que los campos no esten llenos de espacios
    if not value or not value.strip():
        raise ValidationError("El campo no puede estar vacío o contener solo espacios.")

class SacaEspacios: #saca espacios si hay al inicio o final
    @pre_load
    def strip_strings(self, data, **kwargs):
        for key, value in data.items():
            if isinstance(value, str):
                data[key] = value.strip()
        return data