import React from 'react';
import InputValidate from '@/components/inputValidate/InputValidate';
import SimpleSelect from '@/components/SimpleSelect';
import { SelectItem } from '@/components/ui/select';
import { TIPOS_DOCUMENTO } from '../constants';

const DatosPersonales = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Datos Personales</h3>
    <div className="grid grid-rows-1 md:grid-rows-2 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputValidate
          id="nombre_persona"
          type="text"
          labelText="Nombre"
        />
        <InputValidate
          id="apellido_persona"
          type="text"
          labelText="Apellido"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <SimpleSelect
          name="tipo_documento"
          label="Tipo de documento"
          placeholder="Selecciona un tipo de documento"
          required
        >
          {TIPOS_DOCUMENTO.map((tipo) => (
            <SelectItem key={tipo} value={tipo}>
              {tipo}
            </SelectItem>
          ))}
        </SimpleSelect>
        <InputValidate
          id="num_doc_persona"
          type="text"
          labelText="Nº de documento"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputValidate
          id="fecha_nacimiento_persona"
          type="date"
          placeholder="Ingresa tu fecha de nacimiento"
          labelText="Fecha de nacimiento"
          validateMessage="La fecha de nacimiento es requerida"
          required
        />
      </div>
    </div>
  </div>
);

export default DatosPersonales;
