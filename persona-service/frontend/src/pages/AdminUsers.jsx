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
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { Pencil, Eye, Trash2 } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


function AdminUsers() {
  const navigate = useNavigate();
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

  const handleSeeDetails = (id) => {
    navigate(`/userdetails/${id}`);
  }

  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="overflow-auto border p-3 rounded-md shadow-sm">
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
                            onClick={() => handleSeeDetails(id)}
                            className="text-blue-600 hover:underline cursor-pointer transition-colors hover:bg-blue-50 rounded px-2 py-1"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Eye />Ver 
                            </span>
                          </button>
                          <button
                            onClick={() => handleEdit(id)}
                            className="text-green-600 hover:underline cursor-pointer transition-colors hover:bg-blue-50 rounded px-2 py-1"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Pencil /> Editar
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="text-red-600 hover:underline cursor-pointer transition-colors hover:bg-red-50 rounded px-2 py-1"
                          >
                            <span className="inline-flex items-center gap-1">
                             <Trash2 /> Borrar 
                            </span>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Breadcrumb className="mt-auto self-start">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/adminpanel">Panel De Administrador</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Panel de Usuarios</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>
    </div>
  );
}

export default AdminUsers;
