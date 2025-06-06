import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Fade } from "react-awesome-reveal";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Pencil, Eye, Trash2, User, Users, Home, ChevronRight } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

import Loading from '../components/loading/Loading'

// Import de services
import { PersonaService } from "@/services/personaService";

function AdminUsers() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [users, setUsers] = useState([]);
  useEffect(() => {
    PersonaService.get_all()
      .then(res => {
        console.log("Respuesta completa:", res);

        if (res && res.data) {
          const personas = res.data;

          const mappedUsers = personas.map(persona => ({
            id: persona.id_persona,
            nombre: persona.nombre_persona,
            apellido: persona.apellido_persona,
            rol: "No definido",
            email: persona.email || "sin@email.com",
            status: "Activo",
          }));

          setUsers(mappedUsers);
        } else {
          console.error("La respuesta no contiene el campo esperado 'data'");
        }
      })
      .catch(err => {
        console.error("Error obteniendo usuarios:", err);
      });
  }, []);

  const handleDelete = (id) => {
    PersonaService.borrar(id)
      .then(res => {
        console.log("Usuario eliminado:", res);
        setUsers(users.filter((user) => user.id !== id));

      })
      .catch(err => {
        console.error("Error eliminando usuario:", err);
      });
  };

  const handleSeeDetails = (id) => {
    navigate(`/userdetails/${id}`);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));

    console.log(editingUser)

    const body = {
      nombre_persona: editingUser.nombre || '',
      apellido_persona: editingUser.apellido || '',
      //email: editingUser.email,
      //rol: editingUser.rol,
      //status: editingUser.status
    };
    console.log("Apellido persona actualizado:", body.apellido_persona);

    PersonaService.editar(editingUser.id, body)
      .then(res => {
        console.log("Respuesta completa:", res);
      })
      .catch(err => {
        console.error("Error obteniendo usuarios:", err);
      });

    setEditingUser(null);

  };


  if (!users) {
    return <Loading></Loading>;
  }

  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Usuarios Registrados
            </CardTitle>

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
                      <TableCell className="font-medium">{user.nombre} {user.apellido}</TableCell>
                      <TableCell>{user.rol}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button variant="outline" onClick={() => handleSeeDetails(user.id)}>
                            <Eye className="mr-1" /> Ver Más
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => setEditingUser({ ...user })}
                          >
                            <Pencil className="mr-1" /> Edición Rapida
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
                                  Esta acción no se puede deshacer. ¿Deseas eliminar a <strong>{user.nombre} {user.apellido}</strong>?
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
              <BreadcrumbLink href="/adminpanel" className="flex items-center gap-1">
                <Home className="w-4 h-4" />
                Panel De Administrador
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Panel de Usuarios
              </BreadcrumbPage>
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
                  <Label htmlFor="apellido">apellido</Label>
                  <Input
                    id="apellido"
                    value={editingUser.apellido}
                    onChange={(e) => setEditingUser({ ...editingUser, apellido: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select
                    onValueChange={(value) => setEditingUser({ ...editingUser, rol: value })}
                  >
                    <SelectTrigger id="rol" className="w-full">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alumno">Alumno</SelectItem>
                      <SelectItem value="Profesor">Profesor</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Invitado">Invitado</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select
                    onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Selecciona un status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Egresado">Egresado</SelectItem>
                      <SelectItem value="Despedido">Despedido</SelectItem>
                    </SelectContent>
                  </Select>
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
