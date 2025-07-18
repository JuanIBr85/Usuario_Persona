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

export default function FormContacto({
  persona_id,
  setPersonaData,
  contacto,
  redes_sociales,
  showDialog,
  okDialog,
  errorDialog

}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setLoading(true);

    PersonaService.editar_restringido({
      contacto: formData,
    })
      .then((response) => {
        setPersonaData(response.data);
        okDialog();
      })
      .catch((error) => {
        console.error("Error updating domicilio:", error.data);
        errorDialog();
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
              name="telefono_fijo"
              type="tel"
              placeholder="Ingresa tu teléfono fijo"
              labelText="Teléfono Fijo"
              value={contacto?.telefono_fijo || ""}
              validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
              validationMessage="Ingresa un número de teléfono válido"
            />
            <InputValidate
              id="telefono_movil"
              name="telefono_movil"
              type="tel"
              placeholder="Ingresa tu teléfono móvil"
              labelText="Teléfono móvil"
              value={contacto?.telefono_movil || ""}
              validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
              validationMessage="Ingresa un número de teléfono válido"
              required
            />
          </ResponsiveColumnForm>
          <ResponsiveColumnForm>
            <InputValidate
              id="red_social_contacto"
              name="red_social_contacto"
              type="text"
              placeholder="Nombre del Usuario"
              labelText="Red social de contacto"
              value={contacto?.red_social_contacto || ""}
            />
            <SimpleSelect
              name="red_social_nombre"
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
