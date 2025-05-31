import React, { useState } from 'react';
import { Fade } from "react-awesome-reveal";
import { useParams } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Pencil } from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function UserDetails() {
    const { id } = useParams();

    const [users, setUsers] = useState([
        {
            id: 1,
            nombre: "Juan Pérez",
            rol: "Profesor",
            email: "juan.perez@email.com",
            status: "Activo",
            telefono: "(011) 1234-5678",
            direccion: "Av. Corrientes 1234\nCABA, Argentina 1043",
            fechaRegistro: "2024-06-01",
            dni: "12345678",
            beca: "No"
        },
        {
            id: 2,
            nombre: "Lucía Gómez",
            rol: "Alumno",
            email: "lucia.gomez@email.com",
            status: "Egresado",
            telefono: "(011) 8765-4321",
            direccion: "Av. Santa Fe 5678\nCABA, Argentina 1425",
            fechaRegistro: "2023-12-15",
            dni: "87654321",
            beca: "Sí"
        },
    ]);

    const [editingUser, setEditingUser] = useState(null);

    const handleEditSubmit = (e) => {
        e.preventDefault();
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
    };

    const user = users.find(u => u.id === Number(id));

    if (!user) {
        return <div className="p-6">Usuario no encontrado.</div>;
    }

    return (
        <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
            <Fade duration={300} triggerOnce>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <span className='inline-flex items-center gap-1'>
                                <User /> Perfil de Usuario
                            </span>
                        </CardTitle>
                        <CardDescription>Esta es información sobre el usuario.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4 border-b pb-4">
                            <span className="text-sm text-gray-500 font-medium">Nombre completo</span>
                            <span className="sm:col-span-2 text-sm text-gray-900">{user.nombre}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4 border-b pb-4">
                            <span className="text-sm text-gray-500 font-medium">Correo electrónico</span>
                            <span className="sm:col-span-2 text-sm text-gray-900">{user.email}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4 border-b pb-4">
                            <span className="text-sm text-gray-500 font-medium">Teléfono</span>
                            <span className="sm:col-span-2 text-sm text-gray-900">{user.telefono}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4 border-b pb-4">
                            <span className="text-sm text-gray-500 font-medium">Dirección</span>
                            <span className="sm:col-span-2 text-sm text-gray-900 whitespace-pre-line">{user.direccion}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4">
                            <span className="text-sm text-gray-500 font-medium">Rol</span>
                            <span className="sm:col-span-2 text-sm text-gray-900">{user.rol}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4">
                            <span className="text-sm text-gray-500 font-medium">Status</span>
                            <span className="sm:col-span-2 text-sm text-gray-900">{user.status}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4 border-b pb-4">
                            <span className="text-sm text-gray-500 font-medium">Fecha de Registro</span>
                            <span className="sm:col-span-2 text-sm text-gray-900">{user.fechaRegistro}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4 border-b pb-4">
                            <span className="text-sm text-gray-500 font-medium">DNI</span>
                            <span className="sm:col-span-2 text-sm text-gray-900">{user.dni}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4">
                            <span className="text-sm text-gray-500 font-medium">¿Cobra beca?</span>
                            <span className="sm:col-span-2 text-sm text-gray-900">{user.beca}</span>
                        </div>
                    </CardContent>

                    <CardFooter className="justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setEditingUser({ ...user })}
                        >
                            <Pencil className="mr-2" /> Editar
                        </Button>
                    </CardFooter>
                </Card>

                <Breadcrumb className="mt-auto self-start">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/adminpanel">Panel De Administrador</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/adminusers">Panel De Usuarios</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Detalles del Usuario</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </Fade>

            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>Modifica los datos del usuario.</DialogDescription>
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
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input
                                        id="telefono"
                                        value={editingUser.telefono}
                                        onChange={(e) => setEditingUser({ ...editingUser, telefono: e.target.value })}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Input
                                        id="direccion"
                                        value={editingUser.direccion}
                                        onChange={(e) => setEditingUser({ ...editingUser, direccion: e.target.value })}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="rol">Rol</Label>
                                    <Select
                                        onValueChange={(value) => setEditingUser({ ...editingUser, rol: value })}
                                        defaultValue={editingUser.rol}
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
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                                        defaultValue={editingUser.status}
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
                                <div className="grid gap-2">
                                    <Label htmlFor="dni">DNI</Label>
                                    <Input
                                        id="dni"
                                        value={editingUser.dni}
                                        onChange={(e) => setEditingUser({ ...editingUser, dni: e.target.value })}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="beca">¿Cobra beca?</Label>
                                    <Select
                                        onValueChange={(value) => setEditingUser({ ...editingUser, beca: value })}
                                        defaultValue={editingUser.beca}
                                    >
                                        <SelectTrigger id="beca" className="w-full">
                                            <SelectValue placeholder="Selecciona una opción" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sí">Sí</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
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

export default UserDetails;
