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
import { Label } from "recharts";

export default function FormDatos({
  persona_id,
  tipoDocumento,
  personaData,
  handleChange,
  setPersonaData,
  showDialog,
  okDialog,
  errorDialog
}) {
  const [loading, setLoading] = useState(false);
  const [tipoDoc, setTipoDoc] = useState(personaData.tipo_documento || Object.keys(tipoDocumento)[0] || "");

  // Calcular fecha máxima para mayores de 17 años
  const seventeenYearsAgo = new Date();
  seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
  const maxDate = seventeenYearsAgo.toISOString().slice(0, 10);


  const handleSubmit = async (event) => {
    const { email, ...formData } = await formSubmitJson(event);
    document.activeElement.blur();
    setLoading(true);
    PersonaService.editar_restringido(formData)
      .then((response) => {
        setPersonaData(response.data);
        okDialog();
      })
      .catch((error) => {
        console.error("Error updating domicilio:", error.data);
        const title=<div className="flex flex-row items-center gap-2"><Ban /> Ocurrió un error</div>;
        const description=<>
        No se pudieron guardar los datos.<br/>
        Los datos personales solo pueden editarse una vez cada 30 dias.
        </>;
        showDialog({
          title, description, action:"Cerrar"
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      {loading && <Loading isFixed={true} />}
      <form onSubmit={handleSubmit}>
        <div className="min-h-69 space-y-4">
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
            <InputValidate
              labelText="Tipo de documento"
              placeholder="Selecciona un tipo de documento"
              value={personaData.tipo_documento || tipoDoc}
              className="bg-gray-100 cursor-not-allowed w-full"
              readOnly
            />
            <InputValidate
              type="text"
              labelText="Nº de documento"
              value={personaData.num_doc_persona || ""}
              validatePattern={tipoDocumento[tipoDoc]}
              validationMessage="Número de documento inválido"
              className="bg-gray-100 cursor-not-allowed w-full"
              readOnly
            />
          </ResponsiveColumnForm>

          <ResponsiveColumnForm>
            <InputValidate
              type="date"
              placeholder="Ingresa tu fecha de nacimiento"
              labelText="Fecha de nacimiento"
              value={personaData.fecha_nacimiento_persona || ""}
              onChange={(e) =>
                handleChange("fecha_nacimiento_persona", e.target.value)
              }
              validationMessage="La fecha de nacimiento es requerida"
              className="bg-gray-100 cursor-not-allowed w-full"
              readOnly
              max={maxDate}
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
          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs text-gray-500">Los datos personales solo pueden editarse una vez cada 30 dias.</span>
            <span className="text-xs text-gray-500">Los campos bloqueados solo pueden ser editados por el administrador.</span>
          </div>
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