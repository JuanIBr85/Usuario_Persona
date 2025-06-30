import React from 'react';
import InputValidate from '@/components/inputValidate/InputValidate';
import SimpleSelect from '@/components/SimpleSelect';
import { SelectItem } from '@/components/ui/select';
import { ESTADOS_CIVILES, OCUPACIONES, ESTUDIOS_ALCANZADOS } from '../constants';
import ResponsiveColumnForm from '@/components/ResponsiveColumnForm';

const InfoAdicional = ({hidden}) => (
  <div className="space-y-4" hidden={hidden}>
    <h3 className="text-lg font-medium">Información Adicional</h3>
    <ResponsiveColumnForm>
      {/* Estado Civil */}
      <SimpleSelect
        name="estado_civil"
        label="Estado Civil"
        placeholder="Selecciona tu estado civil"
      >
        {ESTADOS_CIVILES.map((estado) => (
          <SelectItem key={estado} value={estado}>
            {estado}
          </SelectItem>
        ))}
      </SimpleSelect>

      {/* Ocupación */}
      <SimpleSelect
        name="ocupacion"
        label="Ocupación"
        placeholder="Selecciona tu ocupación"
      >
        {OCUPACIONES.map((ocupacion) => (
          <SelectItem key={ocupacion} value={ocupacion}>
            {ocupacion}
          </SelectItem>
        ))}
      </SimpleSelect>
    </ResponsiveColumnForm>

    <ResponsiveColumnForm>
      {/* Nivel de Estudios */}
      <SimpleSelect
        name="estudios_alcanzados"
        label="Nivel de Estudios"
        placeholder="Selecciona tu nivel de estudios"
      >
        {ESTUDIOS_ALCANZADOS.map((nivel) => (
          <SelectItem key={nivel} value={nivel}>
            {nivel}
          </SelectItem>
        ))}
      </SimpleSelect>

      {/* Vencimiento DNI */}
      <InputValidate
        id="vencimiento_dni"
        type="date"
        placeholder="Ingresa tu fecha de vencimiento del DNI"
        labelText="Fecha de vencimiento del DNI"
      />
    </ResponsiveColumnForm>
  </div>
);

export default InfoAdicional;
