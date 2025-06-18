import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PersonEditDialog({ editingUser, setEditingUser, onSubmit }) {
  if (!editingUser) return null;

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

            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={editingUser.nombre}
                onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={editingUser.apellido}
                onChange={(e) => setEditingUser({ ...editingUser, apellido: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo_documento">Tipo de Documento</Label>
              <Input
                id="tipo_documento"
                value={editingUser.tipo_documento || ""}
                onChange={(e) => setEditingUser({ ...editingUser, tipo_documento: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nro_documento">Número de Documento</Label>
              <Input
                id="nro_documento"
                value={editingUser.nro_documento || ""}
                onChange={(e) => setEditingUser({ ...editingUser, nro_documento: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={editingUser.fecha_nacimiento || ""}
                onChange={(e) => setEditingUser({ ...editingUser, fecha_nacimiento: e.target.value })}
              />
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
