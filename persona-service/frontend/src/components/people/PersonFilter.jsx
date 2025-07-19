import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/* ----------------------------------------------
 * Componente PersonFilter
 * ----------------------------------------------
 * Permite filtrar personas por nombre, apellido o email.
 * Muestra un input para ingresar texto de búsqueda.
 * ----------------------------------------------
 */
function PersonFilter({mostrarFiltroAvanzado, setMostrarFiltroAvanzado, filtro, setFiltro }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
      {/* Input para filtrar texto con ícono de lupa */}
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar persona por nombre o número de documento..."
          className="w-full pl-10"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>
    </div>
  );
}

export default PersonFilter;