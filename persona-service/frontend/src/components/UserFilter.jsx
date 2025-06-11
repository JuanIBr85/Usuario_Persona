import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function UserFilter({ mostrarFiltroAvanzado, setMostrarFiltroAvanzado


}) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
      <Input
        placeholder="Buscar usuario por nombre, apellido o email"

        className="w-full md:w-1/3"
      />

      <Select >
        <SelectTrigger className="w-full md:w-1/4">
          <SelectValue placeholder="Filtrar por rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="Alumno">Alumno</SelectItem>
          <SelectItem value="Profesor">Profesor</SelectItem>
          <SelectItem value="Admin">Admin</SelectItem>
          <SelectItem value="Invitado">Invitado</SelectItem>
        </SelectContent>
      </Select>

      <Select >
        <SelectTrigger className="w-full md:w-1/4">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="Activo">Activo</SelectItem>
          <SelectItem value="Inactivo">Inactivo</SelectItem>
          <SelectItem value="Egresado">Egresado</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => setMostrarFiltroAvanzado(!mostrarFiltroAvanzado)}

      >
        {mostrarFiltroAvanzado ? "Ocultar filtro avanzado" : "Mostrar filtro avanzado"}
      </Button>
    </div>
  );
}

export default UserFilter;
