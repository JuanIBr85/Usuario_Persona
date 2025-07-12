import React, { useState, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function UserSelectWithSearch({
  usuarios = [],
  value,
  onChange,
  loading = false,
  error = null,
  name,
  label = "",
}) {
  const [userSearch, setUserSearch] = useState("");

  const filteredUsuarios = useMemo(() => {
    if (!userSearch) return usuarios;
    return usuarios.filter(
      (u) =>
        (u.nombre_usuario &&
          u.nombre_usuario.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.email_usuario &&
          u.email_usuario.toLowerCase().includes(userSearch.toLowerCase()))
    );
  }, [userSearch, usuarios]);

  const usuarioValue =
    value === null || value === undefined || value === "" ? "none" : String(value);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1" htmlFor={name || "usuario_id"}>
          {label}
        </label>
      )}
      <Select
        value={usuarioValue}
        onValueChange={(val) => onChange(val === "none" ? null : val)}
        disabled={loading}
        name={name || "usuario_id"}
      >
        <SelectTrigger id={name || "usuario_id"}>
          <SelectValue placeholder="Buscar usuario por nombre o email" />
        </SelectTrigger>
        <SelectContent>
          <div className="px-2 py-1">
            <Input
              autoFocus
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Buscar por email o usuario..."
              className="w-full"
            />
          </div>
          <SelectItem value="none">Ningún usuario</SelectItem>
          {loading && (
            <SelectItem value="loading" disabled>
              Cargando usuarios...
            </SelectItem>
          )}
          {error && (
            <SelectItem value="error" disabled>
              {error}
            </SelectItem>
          )}
          {filteredUsuarios.length === 0 && !loading && !error && (
            <SelectItem value="noresults" disabled>
              No se encontraron usuarios
            </SelectItem>
          )}
          {filteredUsuarios.map((u) => (
            <SelectItem key={u.id} value={String(u.id)}>
              {u.nombre_usuario} ({u.email_usuario})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}