import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import SimpleSelect from "@/components/SimpleSelect";
import { SelectItem } from "@/components/ui/select";

function PersonEditDialog({ editingUser, setEditingUser, onSubmit, tiposDocumentos = [] }) {
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

            <div className="grid gap-4">
              <InputValidate
                id="nombre"
                name="nombre"
                type="text"
                labelText="Nombre"
                value={editingUser.nombre || ""}
                onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                required
              />

              <InputValidate
                id="apellido"
                name="apellido"
                type="text"
                labelText="Apellido"
                value={editingUser.apellido || ""}
                onChange={(e) => setEditingUser({ ...editingUser, apellido: e.target.value })}
                required
              />

              <SimpleSelect
                name="tipo_documento"
                label="Tipo de documento"
                value={editingUser.tipo_documento || "DNI"}
                placeholder="Selecciona un tipo de documento"
                onValueChange={(value) => setEditingUser({ ...editingUser, tipo_documento: value })}
                required
              >
                {tiposDocumentos.map((doc, i) => (
                  <SelectItem key={i} value={doc} >
                    {doc}
                  </SelectItem>
                ))}
              </SimpleSelect>

              <InputValidate
                id="nro_documento"
                name="nro_documento"
                type="text"
                labelText="Número de Documento"
                value={editingUser.nro_documento || ""}
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
