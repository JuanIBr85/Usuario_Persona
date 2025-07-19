import { useState, useMemo } from "react";
import {
  Trash2,
  Pencil,
  Users,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Fade } from "react-awesome-reveal";

export default function RoleList({
  roles,
  onEdit,
  onDelete,
  formatPermissionName,
  groupPermissionsByModule,
  children,
}) {
  // Estado para controlar la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const rolesPerPage = 3; // Mostrar 3 roles por página

  // Calcular el número total de páginas
  const totalPages = Math.ceil(roles.length / rolesPerPage);

  // Obtener solo los roles de la página actual
  const currentRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * rolesPerPage;
    const endIndex = Math.min(startIndex + rolesPerPage, roles.length);
    return roles.slice(startIndex, endIndex);
  }, [roles, currentPage]);

  // Función para cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Función para ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Función para ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generar los números de página a mostrar
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      // Si hay 5 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      pages.push(1);

      // Si la página actual está lejos del inicio, mostrar elipsis
      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      // Mostrar páginas alrededor de la actual
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // Si la página actual está lejos del final, mostrar elipsis
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Siempre mostrar la última página
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-muted-foreground" />
          <CardTitle>
            Lista de roles creados{" "}
            <span className="text-xs text-muted-foreground">
              (Los roles creados por los servicios no pueden ser editado o
              eliminados permanentemente)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {currentRoles.map((role) => {
            const isSuperadminRole = role.id === 1;
            return (
            <Fade key={role.id} duration={500} triggerOnce>
              <Card key={role.id} className="shadow-sm">
                <CardHeader className="flex flex-col justify-between pb-2 md:flex-row md:items-center">
                  <div className="flex items-start gap-2">
                    <Users className="w-5 h-5 mt-1 text-muted-foreground shrink-0" />
                    <div>
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {Object.entries(
                          groupPermissionsByModule(role.permissions)
                        ).map(([modulo, permisos]) => (
                          <div
                            key={modulo}
                            className="mb-1 flex flex-wrap items-center gap-1"
                          >
                            <span className="font-semibold capitalize mr-1">
                              {modulo}:
                            </span>
                            {permisos.map((permiso, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-100 text-gray-700 rounded px-1.5 py-0.5 text-xs mr-1 mb-1"
                              >
                                {permiso}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 md:mt-0">
                    <Button
                      variant="outline"
                      onClick={() => onEdit(role)}
                      disabled={isSuperadminRole}
                      className={"cursor-pointer"}
                      title={
                        isSuperadminRole
                          ? "El rol superadmin no puede editarse"
                          : "Editar"
                      }
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onDelete(role)}
                      disabled={isSuperadminRole}
                      className={"cursor-pointer"}
                      title={
                        isSuperadminRole
                          ? "El rol superadmin no puede borrarse"
                          : "Borrar"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                      Borrar
                    </Button>
                  </div>
                </CardHeader>
              </Card>
              </Fade>
            );
          })}
          {children}

          {totalPages > 1 && (
            <CardFooter className="pt-6">
              <Pagination className="w-full">
                <PaginationContent>
                  {/* Botón Anterior en español */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 px-4 flex items-center gap-1 ${
                        currentPage === 1
                          ? "opacity-50 pointer-events-none"
                          : "cursor-pointer"
                      }`}
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                  </PaginationItem>

                  {getPageNumbers().map((pageNum, index) => {
                    if (
                      pageNum === "ellipsis-start" ||
                      pageNum === "ellipsis-end"
                    ) {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={`page-${pageNum}`}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {/* Botón Siguiente en español */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 px-4 flex items-center gap-1 ${
                        currentPage === totalPages
                          ? "opacity-50 pointer-events-none"
                          : "cursor-pointer"
                      }`}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
