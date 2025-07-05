import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import SimpleSelect from "@/components/SimpleSelect";
import { PersonaService } from "@/services/personaService";
import { useState } from "react";
import { formSubmitJson } from "@/utils/formUtils";
import Loading from "@/components/loading/Loading";
import { Ban } from "lucide-react";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";
import { SimpleDialog } from "@/components/SimpleDialog";

export default function FormDatos({
  persona_id,
  tipoDocumento,
  personaData,
  handleChange,
  setPersonaData,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleSubmit = async (event) => {
    const { email, ...formData } = await formSubmitJson(event);
    document.activeElement.blur();
    setLoading(true);
    PersonaService.editar_restringido( formData)
      .then((response) => {
        setPersonaData(response.data);
      })
      .catch((error) => {
        console.error("Error updating domicilio:", error.data);
        setError(true);
        setOpenDialog(true);
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      {loading && <Loading isFixed={true} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Datos fijos */}
        <ResponsiveColumnForm>
          <InputValidate
            id="nombre_persona"
            type="text"
            labelText="Nombre"
            value={personaData.nombre_persona || ""}
          />
          <InputValidate
            id="apellido_persona"
            type="text"
            labelText="Apellido"
            value={personaData.apellido_persona || ""}
          />
        </ResponsiveColumnForm>
        
        <ResponsiveColumnForm>
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
            value={personaData.num_doc_persona || ""}
          />
        </ResponsiveColumnForm>
        
        <ResponsiveColumnForm>
          <InputValidate
            id="fecha_nacimiento_persona"
            type="date"
            placeholder="Ingresa tu fecha de nacimiento"
            labelText="Fecha de nacimiento"
            value={personaData.fecha_nacimiento_persona || ""}
            onChange={(e) =>
              handleChange("fecha_nacimiento_persona", e.target.value)
            }
            validationMessage="La fecha de nacimiento es requerida"
            required
          />
          <InputValidate
            id="email"
            type="email"
            labelText="Email de usuario"
            value={personaData.email || ""}
            className="bg-gray-100 cursor-not-allowed w-full"
            readOnly
          />
        </ResponsiveColumnForm>
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
        {error && <SimpleDialog
            title={<div className="flex flex-row items-center gap-2"><Ban /> Ocurrió un error</div>}
            description={"No se pudieron guardar los datos. Intenta nuevamente."}
            isOpen={openDialog}
            actionHandle={() => {
              setOpenDialog(null);
            }}
            action="Cerrar"
          />}
      </form>
    </>
  );
}
