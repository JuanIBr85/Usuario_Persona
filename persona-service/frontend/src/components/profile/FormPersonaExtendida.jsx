import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"
import {
  SelectItem
} from "@/components/ui/select"
import SimpleSelect from "@/components/SimpleSelect"
import { PersonaService } from "@/services/personaService"
import { useState } from "react"
import { formSubmitJson } from "@/utils/formUtils"
import Loading from "@/components/loading/Loading"

export default function FormPersonaExtendida({ persona_id, personaExtendida, setPersonaData }) {
  const [loading, setLoading] = useState(false);

  // Opciones para los selects
  const estadosCiviles = [
    'Soltero/a',
    'Casado/a',
    'Divorciado/a',
    'Viudo/a',
    'Separado/a',
    'Unión convivencial',
    'Otro'
  ];

  const nivelesEstudios = [
    'Sin estudios',
    'Primario incompleto',
    'Primario completo',
    'Secundario incompleto',
    'Secundario completo',
    'Terciario/Universitario incompleto',
    'Terciario/Universitario completo',
    'Posgrado',
    'Maestría/Doctorado'
  ];

  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setLoading(true);
    
    // Convertir fecha de vencimiento al formato correcto si existe
    if (formData.vencimiento_dni) {
      formData.vencimiento_dni = new Date(formData.vencimiento_dni).toISOString().split('T')[0];
    }

  };

  return (
    <>
      {loading && <Loading isFixed={true} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estado Civil */}
          <SimpleSelect
            name="estado_civil"
            label="Estado Civil"
            placeholder="Selecciona tu estado civil"
            value={personaExtendida?.estado_civil || ''}
          >
            {estadosCiviles.map((estado) => (
              <SelectItem key={estado} value={estado}>
                {estado}
              </SelectItem>
            ))}
          </SimpleSelect>

          {/* Ocupación */}
          <InputValidate
            id="ocupacion"
            name="ocupacion"
            type="text"
            placeholder="Ingresa tu ocupación"
            labelText="Ocupación"
            value={personaExtendida?.ocupacion || ''}
            validatePattern=".{3,100}"
            validateMessage="La ocupación debe tener entre 3 y 100 caracteres"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nivel de Estudios */}
          <SimpleSelect
            name="estudios_alcanzados"
            label="Nivel de Estudios"
            placeholder="Selecciona tu nivel de estudios"
            value={personaExtendida?.estudios_alcanzados || ''}
          >
            {nivelesEstudios.map((nivel) => (
              <SelectItem key={nivel} value={nivel}>
                {nivel}
              </SelectItem>
            ))}
          </SimpleSelect>

          {/* Vencimiento DNI */}
          <InputValidate
            id="vencimiento_dni"
            name="vencimiento_dni"
            type="date"
            labelText="Vencimiento del DNI"
            value={personaExtendida?.vencimiento_dni ? new Date(personaExtendida.vencimiento_dni).toISOString().split('T')[0] : ''}
            validateMessage="Selecciona una fecha de vencimiento válida"
          />
        </div>

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

        <div className="flex flex-col gap-3 pt-4">
          <Button type="submit" className="w-full">
            {personaExtendida ? 'Actualizar Datos' : 'Guardar Datos'}
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
    </>
  );
}
