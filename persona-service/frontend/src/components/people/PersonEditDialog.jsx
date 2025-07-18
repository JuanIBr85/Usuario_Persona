import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import SimpleSelect from "@/components/SimpleSelect";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

function PersonEditDialog({
  editingUser,
  setEditingUser,
  onSubmit,
  tiposDocumentos = [],
  usuarios = [],
  loading = false,
  error = null,
}) {
  const [userSearch, setUserSearch] = useState("");
  const [tipoDoc, setTipoDoc] = useState(editingUser?.tipo_documento || Object.keys(tiposDocumentos)[0] || "");

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

  if (!editingUser) return null;

  // Adaptar para que null, undefined o "none" sean equivalentes a "ningún usuario"
  const usuarioValue =
    editingUser.usuario_id === null ||
    editingUser.usuario_id === undefined ||
    editingUser.usuario_id === "" // por compatibilidad con valor previo
      ? "none"
      : String(editingUser.usuario_id);

  return (
    <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Persona</DialogTitle>
          <DialogDescription>
            Modifica los datos de la persona. Guarda los cambios al finalizar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4">
              <InputValidate
                id="nombre"
                name="nombre"
                cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
                type="text"
                maxLength={50}
                labelText="Nombre"
                value={editingUser.nombre || ""}
                onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                required
              />

              <InputValidate
                id="apellido"
                name="apellido"
                cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
                maxLength={50}
                type="text"
                labelText="Apellido"
                value={editingUser.apellido || ""}
                onChange={(e) => setEditingUser({ ...editingUser, apellido: e.target.value })}
                required
              />

              <SimpleSelect
                name="tipo_documento"
                label="Tipo de documento"
                value={editingUser.tipo_documento || tipoDoc}
                placeholder="Selecciona un tipo de documento"
                onValueChange={(value) => {
                  setTipoDoc(value);
                  setEditingUser({ ...editingUser, tipo_documento: value });
                }}
                required
              >
                {Object.keys(tiposDocumentos).map((doc, i) => (
                  <SelectItem key={i} value={doc}>
                    {doc}
                  </SelectItem>
                ))}
              </SimpleSelect>

              <InputValidate
                id="nro_documento"
                name="nro_documento"
                type="text"
                labelText="Número de Documento"
                maxLength={13}
                value={editingUser.nro_documento || ""}
                validatePattern={tiposDocumentos[tipoDoc]}
                validationMessage="Número de documento inválido"
                onChange={(e) => setEditingUser({ ...editingUser, nro_documento: e.target.value })}
              />

              <InputValidate
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                labelText="Fecha de Nacimiento"
                value={editingUser.fecha_nacimiento || ""}
                onChange={(e) => setEditingUser({ ...editingUser, fecha_nacimiento: e.target.value })}
              />

              <SimpleSelect
                label="Usuario del sistema"
                name="usuario_id"
                id="usuario_id"
                value={usuarioValue}
                onValueChange={(value) => {
                  setEditingUser({
                    ...editingUser,
                    usuario_id: value === "none" ? null : value,
                  });
                }}
                disabled={loading}
                placeholder="Buscar usuario por nombre o email"
              >
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
              </SimpleSelect>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PersonEditDialog;