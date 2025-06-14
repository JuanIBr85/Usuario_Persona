import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

function PersonaDeleteDialog({ user, onDelete }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Trash2 className="mr-1" /> Borrar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>¿Eliminar persona?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. ¿Deseas eliminar a <strong>{user.nombre} {user.apellido}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => onDelete(user.id)}>
            Confirmar eliminación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PersonaDeleteDialog;
