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

export default function FormContacto({ handleSubmit, fixedData, editableData }) {

  const [redSocialPlataforma, setRedSocialPlataforma] = useState("");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos editables con InputValidate */}
      <InputValidate
        id="telefono_fijo_"
        type="tel"
        placeholder="Ingresa tu teléfono"
        labelText="Teléfono Fijo"
        value={editableData.telefonoFijo}
        validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
        validateMessage="Ingresa un número de teléfono válido"
      />
      <InputValidate
        id="telefono_movil_"
        type="tel"
        placeholder="Ingresa tu teléfono"
        labelText="Teléfono movil"
        value={editableData.telefonoMovil}
        validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
        validateMessage="Ingresa un número de teléfono válido"
      />

      <div className="grid grid-cols-2 gap-4 items-end">
        <InputValidate
          id="red_social_contacto"
          type="text"
          placeholder="Nombre del Usuario"
          labelText="Red social de contacto"
          value={editableData.redSocialContacto}

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
          onClick={() => navigate('/Login')}
        >
          Volver
        </Button>
      </div>
    </form>
  );
}