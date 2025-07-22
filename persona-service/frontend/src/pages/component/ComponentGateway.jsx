import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gatewayService } from "@/services/gatewayService";
import Loading from "@/components/loading/Loading";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";

/**
 * Componente para mostrar el listado de endpoints disponibles
 * Muestra una tabla con los endpoints y sus configuraciones
 */
function ComponentGateway() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const data = await gatewayService.getAllEndpoints();
        setEndpoints(data.data);
      } catch (err) {
        setError("Error al cargar los endpoints");
        console.error("Error fetching endpoints:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoints();
  }, []);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(endpoints.length / itemsPerPage);

  // Obtener solo los items de la página actual
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, endpoints.length);
    return endpoints.slice(startIndex, endIndex);
  }, [endpoints, currentPage]);

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

  if (loading) return <Loading />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6 py-15 px-3 md:py-10 md:px-15">
      <Card className="mx-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Endpoints Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Métodos</TableHead>
                <TableHead>Público</TableHead>
                <TableHead>Limiter</TableHead>
                <TableHead>Cache</TableHead>
                <TableHead>Parametros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((endpoint, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{endpoint.access_url}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {endpoint.methods?.map((method, i) => (
                        <Badge key={i} variant="outline" className="capitalize">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {endpoint.is_public ? (
                      <Badge variant="success">Sí</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>{endpoint.limiter || 'N/A'}</TableCell>
                  <TableCell>
                    {endpoint.cache ? (
                      <Badge variant="outline">
                        {endpoint.cache.expiration}s
                      </Badge>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                  
                    {endpoint.cache?.params ? (
                        endpoint.cache.params.map((param, i) => (
                          <Badge key={`param-${i}`} variant="outline">
                            {param}
                          </Badge>
                        ))
                      ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <CardFooter className="pt-6">
            <Pagination className="w-full">
              <PaginationContent>
                {/* Botón Anterior */}
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-9 px-4 flex items-center gap-1 ${
                      currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"
                    }`}
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                </PaginationItem>

                {getPageNumbers().map((pageNum, index) => {
                  if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
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

                {/* Botón Siguiente */}
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-9 px-4 flex items-center gap-1 ${
                      currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"
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
      </Card>
    </div>
  );
}

export default ComponentGateway;