import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";

export function VerificarIdentidad({ formRef, setDialog, onSubmit }) {
  return (
    <form onSubmit={onSubmit} ref={formRef}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputValidate
            id="nombre_persona"
            name="nombre_persona"
            type="text"
            labelText="Nombre"
            required
          />
          <InputValidate
            id="apellido_persona"
            name="apellido_persona"
            type="text"
            labelText="Apellido"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputValidate
            id="fecha_nacimiento_persona"
            name="fecha_nacimiento_persona"
            type="date"
            placeholder="Ingresa tu fecha de nacimiento"
            labelText="Fecha de nacimiento"
            validationMessage="La fecha de nacimiento es requerida"
            required
          />
          <InputValidate
            id="telefono_movil"
            name="telefono_movil"
            type="tel"
            placeholder="Ingresa tu teléfono móvil"
            labelText="Teléfono móvil"
            validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
            validationMessage="Ingresa un número de teléfono válido"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full"
        >
          Verificar identidad
        </Button>
      </div>
    </form>
  );
}
