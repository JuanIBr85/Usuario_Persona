import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"
import {
  SelectItem
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import SimpleSelect from "@/components/SimpleSelect";

import { PersonaService } from "@/services/personaService"
import { useState } from "react"
import { formSubmitJson } from "@/utils/formUtils"

export default function FormContacto({ persona_id, setPersonaData, contacto, redes_sociales }) {
  const handleSubmit = async (event) => {
      const formData = await formSubmitJson(event);
      document.activeElement.blur();
      PersonaService.editar(persona_id, {
        contacto: formData
      })
        .then(response => {
          setPersonaData(response.data);
        })
        .catch(error => {
          console.error('Error updating domicilio:', error.data);
        });
    };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos editables con InputValidate */}
      <InputValidate
        id="telefono_fijo"
        name="telefono_fijo"
        type="tel"
        placeholder="Ingresa tu teléfono fijo"
        labelText="Teléfono Fijo"
        value={contacto?.telefono_fijo || ''}
        validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
        validateMessage="Ingresa un número de teléfono válido"
      />
      <InputValidate
        id="telefono_movil"
        name="telefono_movil"
        type="tel"
        placeholder="Ingresa tu teléfono móvil"
        labelText="Teléfono móvil"
        value={contacto?.telefono_movil || ''}
        validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
        validateMessage="Ingresa un número de teléfono válido"
        required
      />

      <div className="grid grid-cols-2 gap-4 items-end">
        <InputValidate
          id="red_social_contacto"
          name="red_social_contacto"
          type="text"
          placeholder="Nombre del Usuario"
          labelText="Red social de contacto"
          value={contacto?.red_social_contacto || ''}
        />
        <SimpleSelect
          name="red_social_nombre"
          label="Red social"
          placeholder="Selecciona una red social"
          value={contacto?.red_social_nombre}
          required
          id="red_social_nombre"
          onChange={(e) => console.log(e.target.value)}
        >
          {redes_sociales.map((red) => (
            <SelectItem key={red} value={red}>
              {red}
            </SelectItem>
          ))}
        </SimpleSelect>
      </div>

      <InputValidate
        id="email_contacto"
        type="email"
        labelText="Email de contacto"
        placeholder="Ingresa el email de contacto"
        validateMessage="Email inválido"
        value={contacto?.email_contacto || ''}
      />

      <div className="flex flex-col gap-3 pt-4">
        <Button type="submit" className="w-full">
          Guardar Cambios
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => window.history.back()}
        >
          Volver
        </Button>
      </div>
    </form>
  );
}