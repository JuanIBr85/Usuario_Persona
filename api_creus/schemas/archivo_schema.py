from marshmallow import Schema, fields, validate

class ArchivoSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=255, error="El nombre debe tener entre 1 y 255 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    url_archivo = fields.Str(
        required=True,
        validate=[
            validate.Length(min=3, error="La URL debe tener al menos 3 caracteres"),
            validate.Regexp(r'^\s*\S.*$', error="El campo no puede estar vacío")
        ]
    )
    id_propuesta_educativa = fields.Int(required=True)
    observaciones = fields.Str(allow_none=True)


'''from marshmallow import Schema, fields, validate, validates, ValidationError
from werkzeug.datastructures import FileStorage
from services.archivo_service import ArchivoService

class FileField(fields.Field):
    """Custom field for file uploads."""
    
    def _deserialize(self, value, attr, data, **kwargs):
        if not isinstance(value, FileStorage):
            raise ValidationError("Se esperaba un archivo")
        return value

class ArchivoSchema(Schema):
    """Schema for validating file data."""
    
    id = fields.Int(dump_only=True)
    nombre = fields.Str(dump_only=True)
    ruta = fields.Str(dump_only=True)
    tipo = fields.Str(dump_only=True)
    tamaño = fields.Int(dump_only=True)
    id_convenio = fields.Int(allow_none=True)
    id_institucion = fields.Int(allow_none=True)
    fecha_subida = fields.DateTime(dump_only=True)
    subido_por = fields.Int(dump_only=True)
    activo = fields.Bool(dump_only=True)
    url_descarga = fields.Str(dump_only=True)
    
    # For file uploads
    archivo = FileField(required=True, load_only=True)
    
    @validates('archivo')
    def validate_archivo(self, value):
        if not ArchivoService.allowed_file(value.filename):
            raise ValidationError("Tipo de archivo no permitido")

# Schema instances
archivo_schema = ArchivoSchema()
archivos_schema = ArchivoSchema(many=True)
archivo_upload_schema = ArchivoSchema(only=('archivo', 'id_convenio', 'id_institucion'))
archivo_update_schema = ArchivoSchema(only=('id_convenio', 'id_institucion'), partial=True)'''
