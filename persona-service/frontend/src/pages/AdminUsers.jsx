import React, { useState } from "react";
import {
  Table, TableBody, TableCaption, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Fade } from "react-awesome-reveal";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Eye, Trash2 } from "lucide-react";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AdminUsers() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const [editingUser, setEditingUser] = useState(null);

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleSeeDetails = (id) => {
    navigate(`/userdetails/${id}`);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
          </CardHeader>

          <CardContent>
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nombre}</TableCell>
                      <TableCell>{user.rol}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button variant="outline" onClick={() => handleSeeDetails(user.id)}>
                            <Eye className="mr-1" /> Ver
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => setEditingUser({ ...user })}
                          >
                            <Pencil className="mr-1" /> Editar
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <Trash2 className="mr-1" /> Borrar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px]">
                              <DialogHeader>
                                <DialogTitle>¿Eliminar usuario?</DialogTitle>
                                <DialogDescription>
                                  Esta acción no se puede deshacer. ¿Deseas eliminar a <strong>{user.nombre}</strong>?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                  <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  Confirmar eliminación
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario. Guarda los cambios al finalizar.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleEditSubmit}>
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
                  <Label htmlFor="rol">Rol</Label>
                  <Input
                    id="rol"
                    value={editingUser.rol}
                    onChange={(e) => setEditingUser({ ...editingUser, rol: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminUsers;
