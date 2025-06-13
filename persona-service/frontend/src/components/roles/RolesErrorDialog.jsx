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
  Settings2,
} from "lucide-react";


function RolesErrorDialog({ errorDialog, setErrorDialog}) {
    return (
        <Dialog
            open={errorDialog.open}
            onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        >
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Settings2 className="text-red-500 w-5 h-5" />
                        <DialogTitle>Error</DialogTitle>
                    </div>
                    <DialogDescription>{errorDialog.message}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end">
                    <Button
                        onClick={() =>
                            setErrorDialog({ ...errorDialog, open: false })
                        }
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RolesErrorDialog