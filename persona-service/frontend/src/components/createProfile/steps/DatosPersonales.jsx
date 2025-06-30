import React from 'react';
import InputValidate from '@/components/inputValidate/InputValidate';
import SimpleSelect from '@/components/SimpleSelect';
import { SelectItem } from '@/components/ui/select';
import { TIPOS_DOCUMENTO } from '../constants';
import ResponsiveColumnForm from '@/components/ResponsiveColumnForm';

const DatosPersonales = ({hidden}) => (
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
          required
        />
    </ResponsiveColumnForm>
    <ResponsiveColumnForm>
      <InputValidate
        id="fecha_nacimiento_persona"
        type="date"
        placeholder="Ingresa tu fecha de nacimiento"
        labelText="Fecha de nacimiento"
        validateMessage="La fecha de nacimiento es requerida"
        required
      />
      <div /> {/* Espacio vacío para mantener el diseño de dos columnas */}
    </ResponsiveColumnForm>
  </div>
);

export default DatosPersonales;
