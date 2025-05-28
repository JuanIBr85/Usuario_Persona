import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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
        <div className='p-6'>
            <div className="bg-white overflow-hidden shadow rounded-lg border m-5">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Perfil de Usuario
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Esta es información sobre el usuario.
                    </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Nombre completo
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {user.nombre}
                            </dd>
                        </div>
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Correo electrónico
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {user.email}
                            </dd>
                        </div>
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Teléfono
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {user.telefono}
                            </dd>
                        </div>
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Dirección
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2" style={{ whiteSpace: 'pre-line' }}>
                                {user.direccion}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
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
                        <BreadcrumbPage>Detalles de Usuario</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}

export default UserDetails