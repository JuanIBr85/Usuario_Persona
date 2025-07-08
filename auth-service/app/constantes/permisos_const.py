from common.utils.get_component_info import get_component_info

# Se obtienen los permisos del servicio de autenticación del yml
PERMISOS = get_component_info()["permissions"]

# Permisos por rol
PERMISOS_POR_ROL = get_component_info()["roles"]
