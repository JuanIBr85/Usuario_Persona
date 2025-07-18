import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {

  AlertTriangle,
} from "lucide-react";


function RolesDeleteDialog({openDeleteDialog,setOpenDeleteDialog,roleToDelete, confirmDeleteRole}) {
    return (
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500 w-5 h-5" />
                        <DialogTitle>¿Estás seguro?</DialogTitle>
                    </div>
                    <DialogDescription>
                        Esta acción no se puede deshacer. Se eliminará el rol{" "}
                        <strong>{roleToDelete?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenDeleteDialog(false)} className={"cursor-pointer"}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={confirmDeleteRole} className={"cursor-pointer"}>
                        Eliminar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RolesDeleteDialog