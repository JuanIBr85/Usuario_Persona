import yaml
import os
import re

# Cargar el archivo YML
with open(os.path.join(os.getcwd(), "component-info.yml"), "r") as file:
    _component_info = yaml.safe_load(file)


for permission in _component_info["permissions"]:
    if not isinstance(permission, str) or not permission or not re.match(
        r"^[a-z]+\.[a-z]+\.[a-z]+(_[a-z]+)*$", permission
    ):
        raise ValueError(
            f"El permiso {permission} no cumple con el formato <servicio>.<grupo>.<permiso> todo en minusculas"
        )

def get_component_info():
    return _component_info
