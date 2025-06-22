from typing import Callable

# Almaceno los metodos de los canales
_receiver = {}


# Decorador que registra los metodos de mensajeria del componente
def receiver(channel: str = "default"):
    def decorador(f):
        if channel in _receiver:
            raise ValueError(f"El canal {channel} ya esta registrado")

        if not callable(f):
            raise ValueError("El decorador receiver solo puede ser usado con funciones")

        _receiver[channel] = f
        return f

    return decorador


# Obtiene los metodos de mensajeria del componente
def get_receiver(channel: str) -> Callable | None:
    return _receiver.get(channel)


def get_all_receivers() -> dict[str, Callable]:
    return _receiver


def exist_receiver(channel: str) -> bool:
    return channel in _receiver
