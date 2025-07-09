import React from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight, User, BookUser } from "lucide-react";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function PersonDetailsBreadcrumb() {
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
        <BreadcrumbSeparator>
          <ChevronRight className="w-4 h-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/adminpersons" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Panel de Personas
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="w-4 h-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem className="flex items-center gap-1">
          <BookUser className="w-4 h-4" />
          <BreadcrumbPage>Detalles de la Persona</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default PersonDetailsBreadcrumb;