import React, { useState } from 'react';
import InputValidate from '@/components/inputValidate/InputValidate';
import SimpleSelect from '@/components/SimpleSelect';
import { SelectItem } from '@/components/ui/select';
import ResponsiveColumnForm from '@/components/ResponsiveColumnForm';



const DatosPersonales = ({ hidden, staticData, documento }) => {
  const [tipoDoc, setTipoDoc] = useState(Object.keys(staticData.tipos_documento)[0] || '');

  return (
    <div className="space-y-4" hidden={hidden}>
      <h3 className="text-lg font-medium">Datos Personales</h3>
      <ResponsiveColumnForm>
        <InputValidate
          id="nombre_persona"
          type="text"
          labelText="Nombre"
          required
        />
        <InputValidate
          id="apellido_persona"
          type="text"
          labelText="Apellido"
          required
        />
      </ResponsiveColumnForm>
      <ResponsiveColumnForm>
        <InputValidate
          type="text"
          labelText="Tipo de documento"
          value={documento?.tipo_documento}
          validationMessage="Número de documento inválido"
          className="bg-gray-100 cursor-not-allowed w-full"
          readOnly
        />
        <InputValidate
          type="text"
          labelText="Nº de documento"
          value={documento?.num_doc_persona}
          validatePattern={staticData.tipos_documento[tipoDoc]}
          validationMessage="Número de documento inválido"
          className="bg-gray-100 cursor-not-allowed w-full"
          readOnly
        />
      </ResponsiveColumnForm>
      <ResponsiveColumnForm>
        <InputValidate
          id="fecha_nacimiento_persona"
          type="date"
          placeholder="Ingresa tu fecha de nacimiento"
          labelText="Fecha de nacimiento"
          validationMessage="La fecha de nacimiento es requerida"
          required
          max={new Date().toISOString().split('T')[0]}
        />
      </ResponsiveColumnForm>
    </div>
  )
};

export default DatosPersonales;