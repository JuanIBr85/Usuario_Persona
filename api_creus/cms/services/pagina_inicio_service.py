from cms.models.pagina_inicio_model import PaginaInicio
from models import db
from utils.response_utils import (make_response, ResponseStatus)

class PaginaInicioService:

    @staticmethod
    def get_datos():
        datos = PaginaInicio.query.first()

        if not datos:
            return make_response(ResponseStatus.SUCCESS, "No se encontraron datos de página de inicio")

        return make_response(ResponseStatus.SUCCESS, "Datos de página de inicio obtenidos correctamente", datos.to_dict())

    @staticmethod
    def update_datos(data):
        datos = PaginaInicio.query.first()

        # Si no existen, se crean
        if not datos:
            try:
                nuevo = PaginaInicio(
                    titulo=data.get('titulo'),
                    subtitulo=data.get('subtitulo'),
                    slogan=data.get('slogan')
                )
                db.session.add(nuevo)
                db.session.commit()
                return make_response(ResponseStatus.SUCCESS, "Página de inicio creada correctamente", nuevo.to_dict())
            except Exception as e:
                return make_response(ResponseStatus.ERROR, "Error al crear los datos de página de inicio", {"detalle": str(e)})

        # Si ya existen, se actualizan
        try:
            datos.titulo = data.get('titulo', datos.titulo)
            datos.subtitulo = data.get('subtitulo', datos.subtitulo)
            datos.slogan = data.get('slogan', datos.slogan)

            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Página de inicio actualizada correctamente", datos.to_dict())
        except Exception as e:
            return make_response(ResponseStatus.ERROR, "Error al actualizar los datos de página de inicio", {"detalle": str(e)}, 500)