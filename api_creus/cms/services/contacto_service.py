from cms.models.contacto_model import Contacto
from models import db
from utils.response_utils import (make_response, ResponseStatus)

class ContactoService:
    
    @staticmethod
    def get_contacto(): 
        contacto = Contacto.query.first()

        if not contacto:
            return make_response(ResponseStatus.SUCCESS, "No se encontraron datos de contacto", data=[])

        return make_response(ResponseStatus.SUCCESS, "Datos de contacto obtenidos correctamente", data=[contacto.to_dict()])

    @staticmethod
    def update_contacto(data):
        contacto = Contacto.query.first()

        # Si no existe contacto se crea
        if not contacto:
            try:
                nuevo = Contacto(
                    direccion=data.get('direccion'),
                    email=data.get('email'),
                    telefono=data.get('telefono'),
                    localidad=data.get('localidad'),
                    provincia=data.get('provincia'),
                    codigo_postal=data.get('codigo_postal'),
                    facebook=data.get('facebook'),
                    instagram=data.get('instagram'),
                    whatsapp=data.get('whatsapp'),
                )
                db.session.add(nuevo)
                db.session.commit()
                return make_response(ResponseStatus.SUCCESS, "Contacto creado correctamente", nuevo.to_dict())
            except Exception as e:
                return make_response(ResponseStatus.ERROR, "Error al crear el contacto", {"detalle": str(e)})

        # Si ya existe se actualiza
        try:
            contacto.direccion = data.get('direccion', contacto.direccion)
            contacto.email = data.get('email', contacto.email)
            contacto.telefono = data.get('telefono', contacto.telefono)
            contacto.localidad = data.get('localidad', contacto.localidad)
            contacto.provincia = data.get('provincia', contacto.provincia)
            contacto.codigo_postal = data.get('codigo_postal', contacto.codigo_postal)
            contacto.facebook = data.get('facebook', contacto.facebook)
            contacto.instagram = data.get('instagram', contacto.instagram)
            contacto.whatsapp = data.get('whatsapp', contacto.whatsapp)

            db.session.commit()
            return make_response(ResponseStatus.SUCCESS, "Contacto actualizado correctamente", contacto.to_dict())
        except Exception as e:
            return make_response(ResponseStatus.ERROR,"Error al actualizar el contacto", {"detalle": str(e)}, 500)