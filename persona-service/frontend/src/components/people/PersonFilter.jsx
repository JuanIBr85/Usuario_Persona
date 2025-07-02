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
      {/* Input para filtrar texto */}
      <Input
        placeholder="Buscar persona por nombre o número de documento..."
        className="w-full md:w-1/3"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
    </div>
  );
}

export default PersonFilter;
