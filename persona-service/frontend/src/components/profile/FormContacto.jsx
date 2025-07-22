import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import SimpleSelect from "@/components/SimpleSelect";
import { Ban } from "lucide-react";

import { PersonaService } from "@/services/personaService";
import { useState } from "react";
import { formSubmitJson } from "@/utils/formUtils";
import Loading from "@/components/loading/Loading";
import { SimpleDialog } from "@/components/SimpleDialog";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";

/**
 * FormContacto
  *
 * Formulario utilizado para editar la información de contacto de una persona.
 * Envía los datos al backend mediante PersonaService y muestra un diálogo de
  * confirmación o error según corresponda.
 */



export default function FormContacto({
  persona_id, // identificador de la persona a modificar
  setPersonaData, // callback para actualizar el estado del padre
  contacto, // datos de contacto actuales
  redes_sociales, // listado de redes sociales disponibles
  showDialog,
  okDialog, // función que muestra el diálogo de éxito
  errorDialog  // función que muestra el diálogo de error

}) {
  const [loading, setLoading] = useState(false);

  // Maneja el envío del formulario
  const handleSubmit = async (event) => {
    // Obtiene los datos validados del formulario
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    // Muestra indicador de carga
    setLoading(true);

    // Llama al servicio para actualizar el contacto en el backend
    PersonaService.editar_restringido({
      contacto: formData,
    })
      .then((response) => {
        // Actualiza el estado con los datos devueltos
        setPersonaData(response.data);
        // Notifica éxito al usuario
        okDialog();
      })
      .catch((error) => {
        // Registra el error y muestra el mensaje correspondiente
        console.error("Error updating domicilio:", error?.data);

        errorDialog(error?.data?.error?.server || error?.data?.error);
      })
      .finally(() => setLoading(false));
  };
  return (
    <>
      {loading && <Loading isFixed={true} />}
      <form onSubmit={handleSubmit} >
        <div className="min-h-69 space-y-4">
          <ResponsiveColumnForm>
            {/* Datos editables con InputValidate */}
            <InputValidate
              id="telefono_fijo"
              type="tel"
              maxLength={20}
              placeholder="Ingresa tu teléfono fijo"
              labelText="Teléfono Fijo"
              value={contacto?.telefono_fijo || ""}
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
              value={contacto?.telefono_movil || ""}
              validationMessage="Ingresa un número de teléfono válido EJ: +5492926396430"
              required
            />
          </ResponsiveColumnForm>
          <ResponsiveColumnForm>
            <InputValidate
              id="red_social_contacto"
              type="text"
              maxLength={50}
              cleanRegex={/[^a-zA-Z0-9@._-]/g}
              placeholder="Nombre del Usuario"
              labelText="Red social de contacto"
              value={contacto?.red_social_contacto || ""}
              validationMessage="Email inválido"
            />
            <SimpleSelect
              label="Red social"
              placeholder="Selecciona una red social"
              value={contacto?.red_social_nombre}
              id="red_social_nombre"
              onChange={(e) => console.log(e.target.value)}
            >
              {redes_sociales.map((red) => (
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
            value={contacto?.email_contacto || ""}

            required
          />
          <InputValidate
            id="observacion_contacto"
            type="text"
            labelText="Observación del contacto"
            placeholder="Ingresa una observación"
            value={contacto?.observacion_contacto || ""}
            maxLength={150}
            validationMessage="Se a ingresado uno o mas caracteres invalidos"
          />
        </div>
        <div className="flex flex-col gap-3 pt-4">
          <Button type="submit" className="w-full">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </>
  );
}
