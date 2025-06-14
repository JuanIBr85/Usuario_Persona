import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, User, ChevronRight } from "lucide-react";

function PersonBreadcrumb() {
  return (
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
            Panel de Personas
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default PersonBreadcrumb;
