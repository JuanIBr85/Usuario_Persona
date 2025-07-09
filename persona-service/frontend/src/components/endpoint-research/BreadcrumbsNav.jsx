import React from "react";
import { Link } from "react-router-dom";
import { Home, ShieldUser, Eye } from "lucide-react";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function BreadcrumbsNav() {
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
          <BreadcrumbLink asChild>
            <Link to="/adminservices" className="flex items-center gap-1">
              <ShieldUser className="w-4 h-4" />
              Gestión de Servicios
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            Monitoreo de Servicios
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbsNav;