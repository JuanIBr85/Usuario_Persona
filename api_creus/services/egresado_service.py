from models.egresado_model import Egresado
from models import db
from datetime import datetime
from utils.response_utils import(
    success_object,
    success_list,
    success_empty,
    success_created,
    error_response
)

class EgresadoService:
    @staticmethod
    def get_all():
        #Traer todos los egresados
        egresados = Egresado.query.all()

        if not egresados:
            return success_empty("No hay egresados")
        
        data = [e.to_dict() for e in egresados]
        return success_list (data, "Lista de egresados obtenida con exito.")
    
    @staticmethod
    def get_by_id(id):
        #obtener egresado por id
        egresado = Egresado.query.get(id)
        if not egresado:
            return error_response(f"No se encontró el egresado con ID: {id}",404)
        
        return success_object(egresado.to_dict(), "Egresado encontrado.")
    
    @staticmethod
    def get_by_cohorte(id_cohorte):
        #Obtener egresado por la cohorte
        egresados = Egresado.query.filter_by(id_cohorte = id_cohorte).all()
        if not egresados:
            return error_response("No se encontraron egresados", {"id_cohorte": f"No hay registros para el ID {id_cohorte}"})
        
        data = [e.to_dict() for e in egresados]
        return success_list (data, f"Lista de egresados por cohorte con ID: {id_cohorte}")
    
    @staticmethod
    def create(data):
        #crear un egresado
        try:
            nuevo_egresado = Egresado(
                id_persona = data.get('id_persona'),
                fecha_egreso = data.get('fecha_egreso'),
                id_cohorte = data.get('id_cohorte'),
                testimonio = data.get('testimonio'),
                id_estado = data.get('id_estado'),
                observaciones = data.get('observaciones')
            )
            db.session.add(nuevo_egresado)
            db.session.commit()
            return success_created(nuevo_egresado.id, "Egresado creado correctamente.")
        
        except Exception as e:
            return error_response("Error al crear el egresado", {"detalle": str(e)},500)
        
    @staticmethod
    def update (id,data):
        egresado = Egresado.query.get(id)

        if not egresado:
            return error_response("No se encontro el egresado", {"id": f"{id}"},404)
        
        try:
            egresado.id_persona = data.get('id_persona', egresado.id_persona)
            egresado.fecha_egreso = data.get('fecha_egreso', egresado.fecha_egreso)
            egresado.id_cohorte = data.get('id_cohorte', egresado.id_cohorte)
            egresado.testimonio = data.get('testimonio', egresado.testimonio)
            egresado.id_estado = data.get('id_estado', egresado.id_estado)
            egresado.observaciones = data.get('observaciones', egresado.observaciones)
        
            db.session()
            return success_object({"id": egresado.id}, "Egresado actualizado correctamente")
        
        except Exception as e:
            return error_response("Error al actualizar al egresado", {"detalle": str(e)},500)
        

    @staticmethod
    def delete (id):
        egresado = Egresado.query.get(id)
        if not egresado:
            return error_response("No se encontró el egresado", {"id": f"{id}"},404)
        
        if egresado.id_estado == 2:
            return error_response("El egresado ya esta inactivo", {"estado": "Inactiva"}, 400)
        
        try:
            egresado.id_estado = 2 #borrado logico (id_estado 2 es inactivo)
            db.session.commit()
            return success_object({"id": egresado.id}, "El egresado fue ocultado correctamente")
        except Exception as e:
            return error_response("Error al ocultar al egresado",{"detalle":str(e)},500)