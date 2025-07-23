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

/**
 * FormPersonaExtendida
 *
 * Formulario para editar la información complementaria de una persona.
 * Envía los datos al backend mediante `PersonaService` y muestra un diálogo
 * de confirmación o error según corresponda.
 */


export default function FormPersonaExtendida({
  persona_id,
  personaExtendida, // datos actuales de la persona extendida
  estadosCiviles, // lista de estados civiles disponibles
  ocupaciones, // lista de ocupaciones disponibles
  estudiosAlcanzados, // lista de niveles de estudio disponibles
  setPersonaData, // callback para actualizar el estado del padre
  showDialog,
  okDialog, // función que muestra el diálogo de éxito
  errorDialog // función que muestra el diálogo de error
}) {
  const [loading, setLoading] = useState(false);

  // Maneja el envío del formulario
  const handleSubmit = async (event) => {
    // Obtiene los datos validados del formulario
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    // Muestra indicador de carga
    setLoading(true);
    console.log(formData);
    // Envía la información actualizada al backend
    PersonaService.editar_restringido({
      persona_extendida: formData,
    })
      .then((response) => {
        // Actualiza el estado con los datos devueltos
        setPersonaData(response.data);
        // Notifica éxito al usuario
        okDialog();
      })
      .catch((error) => {
        // Registra el error y muestra el mensaje correspondiente
        console.error("Error updating persona extendida:", error);
        errorDialog(error?.data?.error?.server || error?.data?.error);
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
              id="estado_civil"
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
              id="ocupacion"
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
              id="estudios_alcanzados"
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
              min={new Date().toISOString().split("T")[0]}
              max={(() => {
                const fechaActual = new Date();
                fechaActual.setFullYear(fechaActual.getFullYear() + 16);
                return fechaActual.toISOString().split("T")[0];
              })()}
              onChange={(e) => handleChange("vencimiento_dni", e.target.value)}
              validationMessage="Fecha de vencimiento inválida"
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