import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";

export function VerificarIdentidad({ formRef, setDialog }) {
  return (
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
        type="button" 
        className="w-full" 
        onClick={() => setDialog({
          title: "Verificar identidad",
          description: <>
            Tus datos concuerdan, enviaremos una petición de verificación al administrador, te contactaremos pronto
            <br />
            En caso de no ser contactado, puedes contactarnos al correo <a className="text-blue-500" href="mailto:soporte@persona.com">soporte@persona.com</a>
            <br />
            o llamar al número <a className="text-blue-500" href="tel:+56912345678">+56912345678</a>
          </>
        })}
      >
        Verificar identidad
      </Button>
    </div>
  );
}
