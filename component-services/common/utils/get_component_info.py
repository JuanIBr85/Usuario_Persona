import yaml
import os

# Cargar el archivo YML
with open(os.path.join(os.getcwd(), "component-info.yml"), "r") as file:
    _component_info = yaml.safe_load(file)


def get_component_info():
    return _component_info
