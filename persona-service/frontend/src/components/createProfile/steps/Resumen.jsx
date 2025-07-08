import React from 'react';
import ResponsiveColumnForm from '@/components/ResponsiveColumnForm';

const formatDate = (dateString) => {
  if (!dateString) return 'No especificada';
  const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString;
  }
  try {
    return new Date(dateString).toLocaleDateString('es-AR', options);
  } catch (error) {
    return 'Fecha inválida';
  }
};

const formatField = (value) => {
  return value !== undefined && value !== null ? value : 'No especificado';
};

const Resumen = ({ hidden, newUser = {} }) => {
  const { 
    nombre_persona, 
    apellido_persona, 
    fecha_nacimiento_persona, 
    tipo_documento, 
    num_doc_persona,
    domicilio = {},
    contacto = {},
    persona_extendida = {}
  } = newUser;

  const { codigo_postal = {} } = domicilio;

  return (
    <div className="space-y-6" hidden={hidden}>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen de tu perfil</h3>
      
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b">Datos Personales</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Nombre: <span className="text-gray-900">{formatField(nombre_persona)}</span></p>
            <p className="text-gray-600">Apellido: <span className="text-gray-900">{formatField(apellido_persona)}</span></p>
            <p className="text-gray-600">Fecha de Nacimiento: <span className="text-gray-900">{formatDate(fecha_nacimiento_persona)}</span></p>
          </div>
          <div>
            <p className="text-gray-600">Tipo de Documento: <span className="text-gray-900">{formatField(tipo_documento)}</span></p>
            <p className="text-gray-600">Número de Documento: <span className="text-gray-900">{formatField(num_doc_persona)}</span></p>
            <p className="text-gray-600">Estado Civil: <span className="text-gray-900">{formatField(persona_extendida.estado_civil)}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b">Contacto</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Email: <span className="text-gray-900">{formatField(contacto.email_contacto)}</span></p>
            <p className="text-gray-600">Teléfono Fijo: <span className="text-gray-900">{formatField(contacto.telefono_fijo)}</span></p>
            <p className="text-gray-600">Teléfono Móvil: <span className="text-gray-900">{formatField(contacto.telefono_movil)}</span></p>
          </div>
          <div>
            <p className="text-gray-600">Red Social: <span className="text-gray-900">{formatField(contacto.red_social_contacto)}</span></p>
            <p className="text-gray-600">Usuario de Red Social: <span className="text-gray-900">{formatField(contacto.red_social_nombre)}</span></p>
            <p className="text-gray-600">Observaciones: <span className="text-gray-900">{formatField(contacto.observacion_contacto)}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b">Domicilio</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Calle: <span className="text-gray-900">{formatField(domicilio.domicilio_calle)} {formatField(domicilio.domicilio_numero)}</span></p>
            <p className="text-gray-600">Piso: <span className="text-gray-900">{formatField(domicilio.domicilio_piso)}</span></p>
            <p className="text-gray-600">Departamento: <span className="text-gray-900">{formatField(domicilio.domicilio_dpto)}</span></p>
          </div>
          <div>
            <p className="text-gray-600">Localidad: <span className="text-gray-900">{formatField(codigo_postal.localidad)}</span></p>
            <p className="text-gray-600">Código Postal: <span className="text-gray-900">{formatField(codigo_postal.codigo_postal)}</span></p>
            <p className="text-gray-600">Referencia: <span className="text-gray-900">{formatField(domicilio.domicilio_referencia)}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b">Información Adicional</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Ocupación: <span className="text-gray-900">{formatField(persona_extendida.ocupacion)}</span></p>
            <p className="text-gray-600">Nivel de Estudios: <span className="text-gray-900">{formatField(persona_extendida.estudios_alcanzados)}</span></p>
          </div>
          <div>
            <p className="text-gray-600">Vencimiento DNI: <span className="text-gray-900">{formatDate(persona_extendida.vencimiento_dni)}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resumen;
