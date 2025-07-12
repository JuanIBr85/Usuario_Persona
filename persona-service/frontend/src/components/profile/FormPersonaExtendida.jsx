import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import SimpleSelect from "@/components/SimpleSelect";
import { PersonaService } from "@/services/personaService";
import { useState } from "react";
import { formSubmitJson } from "@/utils/formUtils";
import Loading from "@/components/loading/Loading";
import { Ban } from "lucide-react";
import { SimpleDialog } from "@/components/SimpleDialog";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";

export default function FormPersonaExtendida({
  persona_id,
  personaExtendida,
  estadosCiviles,
  ocupaciones,
  estudiosAlcanzados,
  setPersonaData, showDialog, okDialog, errorDialog
}) {
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setLoading(true);
    console.log(formData);
    PersonaService.editar_restringido({
      persona_extendida: formData,
    })
      .then((response) => {
        setPersonaData(response.data);
        okDialog();
      })
      .catch((error) => {
        console.error("Error updating persona extendida:", error);
        errorDialog();
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      {loading && <Loading isFixed={true} />}
      <form onSubmit={handleSubmit}>
        <div className="min-h-69 space-y-4">
          <ResponsiveColumnForm>
            {/* Estado Civil */}
            <SimpleSelect
              name="estado_civil"
              label="Estado Civil"
              placeholder="Selecciona tu estado civil"
              value={personaExtendida?.estado_civil || ""}
            >
              {estadosCiviles.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SimpleSelect>

            {/* Ocupación */}
            <SimpleSelect
              name="ocupacion"
              label="Ocupación"
              placeholder="Selecciona tu ocupación"
              value={personaExtendida?.ocupacion || ""}
            >
              {ocupaciones.map((ocupacion) => (
                <SelectItem key={ocupacion} value={ocupacion}>
                  {ocupacion}
                </SelectItem>
              ))}
            </SimpleSelect>
          </ResponsiveColumnForm>

          <ResponsiveColumnForm>
            {/* Nivel de Estudios */}
            <SimpleSelect
              name="estudios_alcanzados"
              label="Nivel de Estudios"
              placeholder="Selecciona tu nivel de estudios"
              value={personaExtendida?.estudios_alcanzados || ""}
            >
              {estudiosAlcanzados.map((nivel) => (
                <SelectItem key={nivel} value={nivel}>
                  {nivel}
                </SelectItem>
              ))}
            </SimpleSelect>

            {/* Vencimiento DNI */}
            <InputValidate
              id="vencimiento_dni"
              type="date"
              placeholder="Ingresa tu fecha de vencimiento del DNI"
              labelText="Fecha de vencimiento del DNI"
              value={personaExtendida?.vencimiento_dni || ""}
              onChange={(e) => handleChange("vencimiento_dni", e.target.value)}
            />
          </ResponsiveColumnForm>

          {/* Foto de perfil (solo visualización, la carga se manejaría aparte) */}
          {personaExtendida?.foto_perfil && (
            <div className="flex flex-col items-center">
              <img
                src={personaExtendida.foto_perfil}
                alt="Foto de perfil actual"
                className="h-32 w-32 rounded-full object-cover mb-2"
              />
              <p className="text-sm text-gray-500">Foto de perfil actual</p>
            </div>
          )}
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