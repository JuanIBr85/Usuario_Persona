import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import PersonaDeleteDialog from "./PersonDeleteDialog";

function PersonTable({ users, onEdit, onSeeDetails, onDelete }) {
  return (
    <Table>
      <TableCaption>Lista de personas registradas.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Nro. Documento</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? (
          users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.nombre} {user.apellido}</TableCell>
              <TableCell className="font-medium">{user.nro_documento} </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-2">
                  <Button variant="outline" onClick={() => onSeeDetails(user.id)}>
                    <Eye className="mr-1" /> Ver Más
                  </Button>
                  <Button variant="outline" onClick={() => onEdit(user)}>
                    <Pencil className="mr-1" /> Edición Rapida
                  </Button>
                  <PersonaDeleteDialog user={user} onDelete={onDelete} />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No se encontraron personas que coincidan con el filtro.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default PersonTable;
