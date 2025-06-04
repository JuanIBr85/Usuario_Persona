import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'

export default function FormDatos({ handleSubmit, tipoDocumento, personaData, handleChange }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos fijos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <InputValidate
          id="nombre"
          type="text"
          labelText="Nombre"
          value={personaData.nombre_persona || ''}
        />
        <InputValidate
          id="apellido"
          type="text"
          labelText="Apellido"
          value={personaData.apellido_persona || ''}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="tipo_documento">Tipo de documento</Label>
          <div className="relative">
            <Select
              value={personaData.tipo_documento}
              onChange={(e) => handleChange('tipo_documento', e.target.value)}
              id="tipo_documento"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {tipoDocumento.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <InputValidate
          id="num_doc_persona"
          type="text"
          labelText="Nº de documento"
          value={personaData.num_doc_persona || ''}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputValidate
          id="fecha_nacimiento_persona"
          type="date"
          placeholder="Ingresa tu fecha de nacimiento"
          labelText="Fecha de nacimiento"
          value={personaData.fecha_nacimiento_persona || ''}
          onChange={(e) => handleChange('fecha_nacimiento_persona', e.target.value)}
          validateMessage="La fecha de nacimiento es requerida"
          required
        />

        <InputValidate
          id="email"
          type="email"
          labelText="Email"
          value={personaData.email || ''}
          className="bg-gray-100 cursor-not-allowed w-full"
          readOnly
        />
      </div>
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
    </form>
  );
}