import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"
import {
  SelectItem
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import SimpleSelect from "@/components/SimpleSelect";
export default function FormContacto({ handleSubmit, contacto, redes_sociales }) {
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