import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

export default function FormContacto({ handleSubmit, contacto, handleChange }) {
  const [redSocialPlataforma, setRedSocialPlataforma] = useState("");

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
        onChange={(e) => handleChange('contacto.telefono_fijo', e.target.value)}
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
        onChange={(e) => handleChange('contacto.telefono_movil', e.target.value)}
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
          onChange={(e) => handleChange('contacto.red_social_contacto', e.target.value)}

        />

        <Select
          value={redSocialPlataforma}
          onValueChange={setRedSocialPlataforma}
          id="select-redsocial"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
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