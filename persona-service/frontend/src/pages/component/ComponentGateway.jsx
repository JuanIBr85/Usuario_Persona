import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gatewayService } from "@/services/gatewayService";
import Loading from "@/components/loading/Loading";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { BASE_URL } from "@/utils/fetchUtils";
import BreadcrumbsNav from "@/components/endpoint-research/BreadcrumbsNav";
 
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEndpoints, setFilteredEndpoints] = useState([]);

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

  useEffect(() => {
    const filtered = endpoints.filter(endpoint => 
      endpoint.access_url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEndpoints(filtered);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  }, [endpoints, searchTerm]);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(endpoints.length / itemsPerPage);

  // Función para manejar el ordenamiento
  const sortedEndpoints = useMemo(() => {
    if (!sortConfig.key) return [...filteredEndpoints];

    return [...filteredEndpoints].sort((a, b) => {
      // Ordenamiento para access_url
      if (sortConfig.key === 'access_url') {
        const aValue = a.access_url || '';
        const bValue = b.access_url || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      
      // Ordenamiento para is_public
      if (sortConfig.key === 'is_public') {
        const aValue = a.is_public ? 'Sí' : 'No';
        const bValue = b.is_public ? 'Sí' : 'No';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      // Ordenamiento para limiter
      if (sortConfig.key === 'limiter') {
        const aValue = a.limiter || '';
        const bValue = b.limiter || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      // Ordenamiento para cache
      if (sortConfig.key === 'cache') {
        const aValue = a.cache?.expiration || 0;
        const bValue = b.cache?.expiration || 0;
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredEndpoints, sortConfig]);

  // Obtener solo los items de la página actual
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sortedEndpoints.length);
    return sortedEndpoints.slice(startIndex, endIndex);
  }, [sortedEndpoints, currentPage]);

  // Función para manejar el cambio de ordenamiento
  const requestSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    // Resetear a la primera página cuando se cambia el ordenamiento
    setCurrentPage(1);
  };

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="ml-1 h-4 w-4" /> : 
      <ArrowDown className="ml-1 h-4 w-4" />;
  };

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl font-semibold">Endpoints Disponibles</CardTitle>
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Buscar por URL..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-accent w-90"
                  onClick={() => requestSort('access_url')}
                >
                  <div className="flex items-center">
                    URL
                    {getSortIcon('access_url')}
                  </div>
                </TableHead>
                <TableHead className="text-center w-20">Métodos</TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-accent w-24"
                  onClick={() => requestSort('is_public')}
                >
                  <div className="flex items-center justify-center">
                    Público
                    {getSortIcon('is_public')}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-accent w-42"
                  onClick={() => requestSort('limiter')}
                >
                  <div className="flex items-center justify-center">
                    Limiter
                    {getSortIcon('limiter')}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-accent w-24"
                  onClick={() => requestSort('cache')}
                >
                  <div className="flex items-center justify-center">
                    Cache
                    {getSortIcon('cache')}
                  </div>
                </TableHead>
                <TableHead className="text-center w-48">Parámetros</TableHead>
                <TableHead className="text-center w-48">Permisos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((endpoint, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium truncate" title={endpoint.access_url}>
                    <a href={`${BASE_URL}/${endpoint.access_url}`} target="_blank" rel="noopener noreferrer" className="truncate">{endpoint.access_url}</a>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      {endpoint.methods?.map((method, i) => (
                        <Badge key={i} variant="outline" className="capitalize">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {endpoint.is_public ? (
                      <Badge variant="success">Sí</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{endpoint.limiter || 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    {endpoint.cache ? (
                      <Badge variant="outline">
                        {endpoint.cache.expiration}s
                      </Badge>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto">
                    {(endpoint.cache?.params && endpoint.cache.params.length > 0) ? (
                        endpoint.cache.params.map((param, i) => (
                          <Badge key={`param-${i}`} variant="outline" className="whitespace-nowrap">
                            {param}
                          </Badge>
                        ))
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto">
                    {(endpoint.access_permissions && endpoint.access_permissions.length > 0) ? (
                        endpoint.access_permissions.map((permission, i) => (
                          <Badge key={`permission-${i}`} variant="outline" className="whitespace-nowrap">
                            {permission}
                          </Badge>
                        ))
                      ) : (
                        'N/A'
                      )}
                    </div>
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
      <BreadcrumbsNav actualPath="Listado de endpoints" />
    </div>
  );
}

export default ComponentGateway;