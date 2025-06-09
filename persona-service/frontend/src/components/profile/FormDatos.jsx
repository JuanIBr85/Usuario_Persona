import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"
import {
  SelectItem
} from "@/components/ui/select"
import SimpleSelect from "@/components/SimpleSelect"
import { PersonaService } from "@/services/personaService"
import { useState } from "react"
import { formSubmitJson } from "@/utils/formUtils"


export default function FormDatos({ persona_id, tipoDocumento, personaData, handleChange, setPersonaData }) {

  const handleSubmit = async (event) => {
    const { email, ...formData } = await formSubmitJson(event);
    document.activeElement.blur();
    PersonaService.editar(persona_id, formData)
      .then(response => {
        setPersonaData(response.data);
      })
      .catch(error => {
        console.error('Error updating domicilio:', error.data);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos fijos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <InputValidate
          id="nombre_persona"
          type="text"
          labelText="Nombre"
          value={personaData.nombre_persona || ''}
        />
        <InputValidate
          id="apellido_persona"
          type="text"
          labelText="Apellido"
          value={personaData.apellido_persona || ''}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <SimpleSelect
          name="tipo_documento"
          label="Tipo de documento"
          placeholder="Selecciona un tipo de documento"
          value={personaData.tipo_documento}
          required
        >
          {tipoDocumento.map((tipo) => (
            <SelectItem key={tipo} value={tipo}>
              {tipo}
            </SelectItem>
          ))}
        </SimpleSelect>
        <InputValidate
          id="num_doc_persona"
          type="text"
          labelText="Nº de documento"
          value={personaData.num_doc_persona || ''}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputValidate
          id="fecha_nacimiento_persona"
          type="date"
          placeholder="Ingresa tu fecha de nacimiento"
          labelText="Fecha de nacimiento"
          value={personaData.fecha_nacimiento_persona || ''}
          onChange={(e) => handleChange('fecha_nacimiento_persona', e.target.value)}
          validateMessage="La fecha de nacimiento es requerida"
          required
        />

        <InputValidate
          id="email"
          type="email"
          labelText="Email de usuario"
          value={personaData.email || ''}
          className="bg-gray-100 cursor-not-allowed w-full"
          readOnly
        />
      </div>
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