import React, { useState } from 'react';
import InputValidate from '@/components/inputValidate/InputValidate';
import SimpleSelect from '@/components/SimpleSelect';
import { SelectItem } from '@/components/ui/select';
import ResponsiveColumnForm from '@/components/ResponsiveColumnForm';



const DatosPersonales = ({ hidden, staticData, documento }) => {
  const [tipoDoc, setTipoDoc] = useState(Object.keys(staticData.tipos_documento)[0] || '');

  const seventeenYearsAgo = new Date();
  seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
  const maxDate = seventeenYearsAgo.toISOString().slice(0, 10);

  return (
    <div className="space-y-4" hidden={hidden}>
      <h3 className="text-lg font-medium">Datos Personales</h3>
      <ResponsiveColumnForm>
        <InputValidate
          id="nombre_persona"
          maxLength={50}
          type="text"
          labelText="Nombre"
          cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
          validationMessage="El nombre es requerido y debe contener solo letras"
          required
        />
        <InputValidate
          id="apellido_persona"
          maxLength={50}
          type="text"
          labelText="Apellido"
          cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
          validationMessage="El apellido es requerido y debe contener solo letras"
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
          max={maxDate}
        />
      </ResponsiveColumnForm>
    </div>
  )
};

export default DatosPersonales;