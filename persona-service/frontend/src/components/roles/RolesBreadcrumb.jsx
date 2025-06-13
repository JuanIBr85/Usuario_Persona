import React from 'react'
import { Link } from "react-router-dom";
import {
    Home,
    ShieldUser
} from "lucide-react";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function RolesBreadcrumb() {
    return (
        <Breadcrumb className="mt-auto self-start">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/adminpanel" className="flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            Panel De Administrador
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-1">
                        <ShieldUser className="w-4 h-4" />
                        Roles y Permisos
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export default RolesBreadcrumb