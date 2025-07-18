import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";

export function VerificarIdentidad({ formRef, setDialog, onSubmit }) {
  const today = new Date().toISOString().slice(0, 10);
  
  return (
    <form onSubmit={onSubmit} ref={formRef}>
      <div className="flex flex-col gap-4">
        <ResponsiveColumnForm>
          <InputValidate
            id="nombre_persona"
            name="nombre_persona"
            type="text"
            labelText="Nombre"
            maxLength={50}
            cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
            required
          />
          <InputValidate
            id="apellido_persona"
            name="apellido_persona"
            maxLength={50}
            type="text"
            labelText="Apellido"
            cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
            required
          />
        </ResponsiveColumnForm>
        <ResponsiveColumnForm>
          <InputValidate
            id="fecha_nacimiento_persona"
            name="fecha_nacimiento_persona"
            type="date"
            placeholder="Ingresa tu fecha de nacimiento"
            labelText="Fecha de nacimiento"
            validationMessage="La fecha de nacimiento es requerida"
            required
            max={today}
          />
          <InputValidate
            id="telefono_movil"
            name="telefono_movil"
            maxLength={20}
            type="tel"
            placeholder="Ingresa tu teléfono móvil"
            labelText="Teléfono móvil"
            validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
            validationMessage="Ingresa un número de teléfono válido"
            required
          />
        </ResponsiveColumnForm>
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
