import React from 'react';
import InputValidate from '@/components/inputValidate/InputValidate';
import SimpleSelect from '@/components/SimpleSelect';
import { SelectItem } from '@/components/ui/select';
import ResponsiveColumnForm from '@/components/ResponsiveColumnForm';

const InfoAdicional = ({hidden, staticData}) => (
  <div className="space-y-4" hidden={hidden}>
    <h3 className="text-lg font-medium">Información Adicional</h3>
    <ResponsiveColumnForm>
      {/* Estado Civil */}
      <SimpleSelect
        name="estado_civil"
        label="Estado Civil"
        placeholder="Selecciona tu estado civil"
      >
        {staticData.estados_civiles.map((estado) => (
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
        {staticData.ocupaciones.map((ocupacion) => (
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
        {staticData.estudios_alcanzados.map((nivel) => (
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
