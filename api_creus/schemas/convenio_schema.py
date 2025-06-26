from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from utils.validation_utils import validar_fechas, SacaEspacios

class ConvenioSchema(SacaEspacios,Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío o solo espacios")
        ]
    )
    descripcion = fields.Str(required=True)
    fecha_inicio = fields.DateTime(required=True)
    fecha_fin = fields.DateTime(required=True)
    id_archivo = fields.Int(allow_none=True)
    id_institucion = fields.Int(required=True)
    id_estado = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)
    
    @validates_schema
    def validar_fechas_schema(self, data, **kwargs):
        try:
            validar_fechas(data.get('fecha_inicio'), data.get('fecha_fin'))
        except ValidationError as e:
            raise ValidationError({"fecha_fin": str(e)})


'''from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import datetime

class ConvenioSchema(Schema):
    """Schema for validating convention data."""
    
    id = fields.Int(dump_only=True)
    nombre = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    descripcion = fields.Str(allow_none=True)
    fecha_inicio = fields.Date(required=True)
    fecha_fin = fields.Date(allow_none=True)
    id_institucion = fields.Int(required=True)
    activo = fields.Bool(load_default=True)
    fecha_creacion = fields.DateTime(dump_only=True)
    fecha_actualizacion = fields.DateTime(dump_only=True)
    
    @validates('fecha_fin')
    def validate_fecha_fin(self, value):
        if value and 'fecha_inicio' in self.context.get('data', {}) and value < self.context['data']['fecha_inicio']:
            raise ValidationError('La fecha de fin no puede ser anterior a la fecha de inicio')
    
    @validates('fecha_inicio')
    def validate_fecha_inicio(self, value):
        if value < datetime.now().date():
            raise ValidationError('La fecha de inicio no puede ser en el pasado')

# Schema instances for different operations
convenio_schema = ConvenioSchema()
convenios_schema = ConvenioSchema(many=True)
convenio_create_schema = ConvenioSchema(exclude=('id', 'fecha_creacion', 'fecha_actualizacion'))
convenio_update_schema = ConvenioSchema(exclude=('id', 'fecha_creacion', 'fecha_actualizacion'), partial=True)'''
