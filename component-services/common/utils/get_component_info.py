import yaml
import os
import re

# Cargar el archivo YML
with open(os.path.join(os.getcwd(), "component-info.yml"), "r") as file:
    _component_info = yaml.safe_load(file)

#Se genera una lista de permisos a partir de los roles
#Por motivos de compatibilidad con versiones anteriores
#Esto lo que hace es sumar las listas de permisos de todos los roles definidos en el archivo yml
#Y convertirlo en una lista(tupla) de permisos

prefix = _component_info["service"]["service_prefix"]

permissions = set(sum(_component_info["roles"].values(), []))
permissions = filter(lambda x: x.startswith(prefix), permissions)
_component_info["permissions"] = tuple(permissions)

for permission in _component_info["permissions"]:
    if not isinstance(permission, str) or not permission or not re.match(
        r"^[a-z]+\.[a-z]+\.[a-z]+(_[a-z]+)*$", permission
    ):
        raise ValueError(
            f"El permiso {permission} no cumple con el formato <servicio>.<grupo>.<permiso> todo en minusculas"
        )
    if not permission.startswith(prefix):
        raise ValueError(
            f"El permiso {permission} no comienza con el prefijo {prefix}"
        )

def get_component_info():
    return _component_info
