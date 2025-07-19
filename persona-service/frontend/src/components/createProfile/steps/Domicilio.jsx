import React from 'react';
import InputValidate from '@/components/inputValidate/InputValidate';
import { useFormDomicilio } from '@/hooks/profile/useFormDomicillio';
import CPLocalidad from '@/components/CPLocalidad';
import ResponsiveColumnForm from '@/components/ResponsiveColumnForm';

const DEFAULT = {
  domicilio_postal: {
    codigo_postal: ""
  }
}

const Domicilio = ({ hidden, staticData }) => {
  const { localidad, setLocalidad } = useFormDomicilio(DEFAULT, () => { }, 0, () => { }, () => { });
  return (
    <div className="space-y-4" hidden={hidden}>
      <h3 className="text-lg font-medium">Domicilio</h3>
      <div className="grid grid-row-1 md:grid-row-2 gap-4">
        <ResponsiveColumnForm className="md:grid-cols-6">
          {/* Campo Calle */}
          <InputValidate
            id="domicilio_calle"
            type="text"
            maxLength={50}
            placeholder="Ingresa el nombre de la calle"
            labelText="Calle"
            validatePattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.]{2,50}$"
            validationMessage="Ingresa un nombre de calle válido (2-50 caracteres, solo letras, números, espacios, puntos y comas)"
            containerClassName="sm:col-span-3"
            required
          />

          {/* Campo Número */}
          <InputValidate
            id="domicilio_numero"
            type="text"
            maxLength={10}
            placeholder="Número de domicilio"
            labelText="Número"
            validatePattern="^[0-9]{1,9}[a-zA-Z]?$"
            validationMessage="Ingresa un número válido (ej: 1234, 123A)"
            required
          />

          {/* Campo Piso (opcional) */}
          <InputValidate
            id="domicilio_piso"
            type="text"
            maxLength={3}
            placeholder="Piso (opcional)"
            labelText="Piso"
            validatePattern="^[0-9]{1,3}$|^$"
            validationMessage="Ingresa un piso válido (máximo 3 dígitos)"
          />

          {/* Campo Departamento (opcional) */}
          <InputValidate
            id="domicilio_dpto"
            type="text"
            maxLength={2}
            placeholder="Departamento (opcional)"
            labelText="Departamento"
            validatePattern="^[a-zA-Z0-9]{1,2}$|^$"
            validationMessage="Ingresa un departamento válido (máximo 2 caracteres)"
          />
        </ResponsiveColumnForm>

        <CPLocalidad showDialog={(e)=>{}} localidad={localidad} codigo_postal={"7540"} setLocalidad={setLocalidad} />
        {/* Campo Referencia */}
        <InputValidate
          id="domicilio_referencia"
          type="text"
          maxLength={200}
          placeholder="Referencia (ej: Entre Calles X e Y)"
          labelText="Referencia"
          validatePattern=".{0,200}"
          validationMessage="Máximo 200 caracteres"
        />
      </div>
    </div>
  );
}

export default Domicilio;
