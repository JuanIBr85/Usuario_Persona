
import { useState } from "react";
import SimpleSelect from "./SimpleSelect";
import { SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

export default function UsuarioSelect({
    usuarios = [],
    id="usuario_id",
    loading = false,
    error = null,
}) {
    const [userSearch, setUserSearch] = useState("");
    const [filteredUsuarios, setFilteredUsuarios] = useState([]);
    useDebounce(() => {
        if (!userSearch) return setFilteredUsuarios(usuarios);
        setFilteredUsuarios(usuarios.filter(
          (u) =>
            (u.nombre_usuario &&
              u.nombre_usuario.toLowerCase().includes(userSearch.toLowerCase())) ||
            (u.email_usuario &&
              u.email_usuario.toLowerCase().includes(userSearch.toLowerCase()))
        ));
      }, 500, [userSearch, usuarios]);
    return (
        <SimpleSelect
            label="Usuario del sistema"
            id={id}
            value="-1"
            disabled={loading}
            placeholder="Buscar usuario por nombre o email"
        >
            <div className="px-2 py-1">
                <Input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Buscar por email o usuario..."
                    className="w-full"
                    onKeyDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            </div>
            <SelectItem value="-1">Ningún usuario</SelectItem>
            {loading && (
                <SelectItem key="loading" disabled>Cargando usuarios...</SelectItem>
            )}
            {error && <SelectItem key="error" disabled>{error}</SelectItem>}
            {filteredUsuarios.length === 0 && !loading && !error && (
                <SelectItem key="noresults" disabled>No se encontraron usuarios</SelectItem>
            )}
            {filteredUsuarios.map((u) => (
                <SelectItem key={u.id} value={`${u.id}`}>
                    {u.nombre_usuario} ({u.email_usuario})
                </SelectItem>
            ))}
        </SimpleSelect>
    );
}