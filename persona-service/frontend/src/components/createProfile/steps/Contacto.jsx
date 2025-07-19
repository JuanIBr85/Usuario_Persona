import React from 'react';
import InputValidate from '@/components/inputValidate/InputValidate';
import SimpleSelect from '@/components/SimpleSelect';
import { SelectItem } from '@/components/ui/select';
import ResponsiveColumnForm from '@/components/ResponsiveColumnForm';

const Contacto = ({hidden, staticData}) => (
  <div className="space-y-4" hidden={hidden}>
    <h3 className="text-lg font-medium">Datos de Contacto</h3>
    <ResponsiveColumnForm>
      <InputValidate
        id="telefono_fijo"
        type="tel"
        maxLength={20}
        placeholder="Ingresa tu teléfono fijo"
        labelText="Teléfono Fijo"
        validatePattern="^\+549\d{10}$"
        validationMessage="Ingresa un número de teléfono válido EJ: +5492926396430"
      />
      <InputValidate
        id="telefono_movil"
        type="tel"
        maxLength={20}
        validatePattern="^\+549\d{10}$"
        placeholder="Ingresa tu teléfono móvil"
        labelText="Teléfono móvil"
        validationMessage="Ingresa un número de teléfono válido EJ: +5492926396430"
        required
      />
    </ResponsiveColumnForm>
    <ResponsiveColumnForm className="items-end">
      <InputValidate
        id="red_social_contacto"
        type="text"
        maxLength={50}
        placeholder="Nombre del Usuario"
        labelText="Red social de contacto"
        cleanRegex={/[^a-zA-Z0-9@._-]/g}
        value=""
        validationMessage="Caracteres invalidos"
      />
      <SimpleSelect
        id="red_social_nombre"
        label="Red social"
        placeholder="Selecciona una red social"
        onChange={(e) => console.log(e.target.value)}
      >
        {staticData.redes_sociales.map((red) => (
          <SelectItem key={red} value={red}>
            {red}
          </SelectItem>
        ))}
      </SimpleSelect>
    </ResponsiveColumnForm>

    <InputValidate
      id="email_contacto"
      type="email"
      maxLength={50}
      labelText="Email de contacto"
      placeholder="Ingresa el email de contacto"
      validationMessage="Email inválido"
      
      required
    />
    <InputValidate
      id="observacion_contacto"
      type="text"
      maxLength={300}
      labelText="Observación del contacto"
      placeholder="Ingresa una observación"
    />
  </div>
);

export default Contacto;
