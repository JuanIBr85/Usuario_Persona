import React from 'react';
import InputValidate from '@/components/inputValidate/InputValidate';
import { useFormDomicilio } from '@/hooks/profile/useFormDomicillio';
import SimpleSelect from '@/components/SimpleSelect';
import { SelectItem } from '@/components/ui/select';
import ResponsiveColumnForm from '@/components/ResponsiveColumnForm';

const DEFAULT = {
  domicilio_postal: {
    codigo_postal: ""
  }
}

const Domicilio = ({hidden}) => {
  const {localidades,  codigoPostal, setCodigoPostal, inputCPRef, localidad} = useFormDomicilio(DEFAULT, ()=>{}, 0, ()=>{}, ()=>{});

  return (
    <div className="space-y-4" hidden={hidden}>
      <h3 className="text-lg font-medium">Domicilio</h3>
      <div className="grid grid-row-1 md:grid-row-2 gap-4">
        <ResponsiveColumnForm className="md:grid-cols-6">
          {/* Campo Calle */}
          <InputValidate
            id="domicilio_calle"
            type="text"
            placeholder="Ingresa el nombre de la calle"
            labelText="Calle"
            validatePattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.]{2,50}$"
            validationMessage="Ingresa un nombre de calle válido (2-50 caracteres, solo letras, espacios, puntos y comas)"
            containerClassName="sm:col-span-3"
            required
          />

          {/* Campo Número */}
          <InputValidate
            id="domicilio_numero"
            type="text"
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
            placeholder="Piso (opcional)"
            labelText="Piso"
            validatePattern="^[0-9]{1,3}$|^$"
            validationMessage="Ingresa un piso válido (máximo 3 dígitos)"
          />

          {/* Campo Departamento (opcional) */}
          <InputValidate
            id="domicilio_dpto"
            type="text"
            placeholder="Departamento (opcional)"
            labelText="Departamento"
            validatePattern="^[a-zA-Z0-9]{1,2}$|^$"
            validationMessage="Ingresa un departamento válido (máximo 2 caracteres)"
          />
        </ResponsiveColumnForm>

        <ResponsiveColumnForm>
          {/* Campo Código Postal */}
          <InputValidate
            id="codigo_postal"
            type="text"
            placeholder="Código postal"
            labelText={<>Código Postal<a href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" className="text-indigo-600 hover:underline cursor-pointer">¿no sabes el codigo?</a></>}
            value={codigoPostal}
            ref={inputCPRef}
            onChange={(e) => setCodigoPostal(e.target.value)}
            validatePattern="^(?:[A-Za-z]\d{4}[A-Za-z]{3}|\d{4})$"
            validationMessage="Ingrese CP (4 dígitos) o CPA (1 letra + 4 dígitos + 3 letras, todo en mayúsculas)"
            required
          />
          <SimpleSelect
            name="localidad"
            label="Localidad"
            placeholder="Selecciona una localidad"
            value={localidad}
            required
          >
            {localidades.map((localidad) => (
              <SelectItem key={localidad} value={localidad}>
                {localidad}
              </SelectItem>
            ))}
          </SimpleSelect>
        </ResponsiveColumnForm>
        {/* Campo Referencia */}
        <InputValidate
          id="domicilio_referencia"
          type="text"
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
