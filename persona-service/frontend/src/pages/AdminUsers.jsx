import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Fade } from "react-awesome-reveal";

function AdminUsers() {
  const [users, setUsers] = useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      rol: "Profesor",
      email: "juan.perez@email.com",
      status: "Activo",
    },
    {
      id: 2,
      nombre: "Lucía Gómez",
      rol: "Alumno",
      email: "lucia.gomez@email.com",
      status: "Egresado",
    },
  ]);

  const handleEdit = (id) => {
    console.log("Editar usuario con id:", id);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres borrar este usuario?")) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="max-w-full mx-auto px-5 pt-25 pb-10 md:py-25 md:px-15">
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
            {users.map(({ id, nombre, rol, email, status }) => (
              <TableRow key={id}>
                <TableCell className="font-medium">{nombre}</TableCell>
                <TableCell>{rol}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell className="text-right space-x-2">
                  <button
                    onClick={() => handleEdit(id)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(id)}
                    className="text-red-600 hover:underline"
                  >
                    Borrar
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Fade>
    </div>
  );
}

export default AdminUsers;
