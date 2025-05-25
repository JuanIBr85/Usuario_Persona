import React from "react";

import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Fade } from 'react-awesome-reveal'

function AdminUsers() {
  return (
    <div className="max-w-full mx-auto p-4">
      <Fade duration={300} triggerOnce>
        <Table>
          <TableCaption>Lista de usuarios registrados.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Juan Pérez</TableCell>
              <TableCell>Profesor</TableCell>
              <TableCell>juan.perez@email.com</TableCell>
              <TableCell>Activo</TableCell>
              <TableCell className="text-right space-x-2">
                <button className="text-blue-600 hover:underline">Editar</button>
                <button className="text-red-600 hover:underline">Borrar</button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Lucía Gómez</TableCell>
              <TableCell>Alumno</TableCell>
              <TableCell>lucia.gomez@email.com</TableCell>
              <TableCell>Egresado</TableCell>
              <TableCell className="text-right space-x-2">
                <button className="text-blue-600 hover:underline">Editar</button>
                <button className="text-red-600 hover:underline">Borrar</button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Fade>
    </div>
  )
}

export default AdminUsers