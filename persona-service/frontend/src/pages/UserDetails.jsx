import React, { useState } from 'react'
import { Fade } from "react-awesome-reveal";
import { useParams } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { User } from "lucide-react"

function UserDetails() {
    const { id } = useParams()
    const [users] = useState([
        {
            id: 1,
            nombre: "Juan Pérez",
            rol: "Profesor",
            email: "juan.perez@email.com",
            status: "Activo",
            telefono: "(011) 1234-5678",
            direccion: "Av. Corrientes 1234\nCABA, Argentina 1043",
        },
        {
            id: 2,
            nombre: "Lucía Gómez",
            rol: "Alumno",
            email: "lucia.gomez@email.com",
            status: "Egresado",
            telefono: "(011) 8765-4321",
            direccion: "Av. Santa Fe 5678\nCABA, Argentina 1425",
        },
    ])

    const user = users.find(u => u.id === Number(id))

    if (!user) {
        return <div className="p-6">Usuario no encontrado.</div>
    }

    return (
        <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
            <Fade duration={300} triggerOnce>
                <Card>
                    <CardHeader>
                        <CardTitle> <span className='inline-flex items-center gap-1'> <User />  Perfil de Usuario</span></CardTitle>
                        <CardDescription>Esta es información sobre el usuario.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
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

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4">
                                <span className="text-sm text-gray-500 font-medium">Dirección</span>
                                <span className="sm:col-span-2 text-sm text-gray-900 whitespace-pre-line">
                                    {user.direccion}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Breadcrumb className="mt-4 self-start">
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
                            <BreadcrumbPage>Detalles de Usuario</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </Fade>
        </div>
    )
}

export default UserDetails