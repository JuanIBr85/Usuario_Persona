import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { componentService } from "@/services/componentService";

function ComponentTable({ data }) {
  const handleToggleService = (id_service, state) => {
    componentService.set_service_available(id_service, state? 0 : 1)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleDeleteService = (id_service) => {
    componentService.delete_service(id_service)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <Table>
      <TableCaption>Información del servicio de personas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nombre del Servicio</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Disponible</TableHead>
          <TableHead>Última Actualización</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data && data.length > 0 ? (
          data.map((service) => (
            <TableRow key={service.id_service}>
              <TableCell className="font-medium">{service.id_service}</TableCell>
              <TableCell>{service.service_name}</TableCell>
              <TableCell>{service.service_description}</TableCell>
              <TableCell>{service.service_url}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${service.health ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {service.health ? 'Activo' : 'Inactivo'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${service.service_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {service.service_available ? 'Sí' : 'No'}
                </span>
              </TableCell>
              <TableCell>{new Date(service.updated_at).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!service.service_wait &&
                      <DropdownMenuItem onClick={() => handleToggleService(service.id_service, service.service_available)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>{service.service_available ? 'Desactivar' : 'Activar'}</span>
                      </DropdownMenuItem>}
                      {!service.service_core &&
                      <DropdownMenuItem onClick={() => handleDeleteService(service.id_service)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>}

                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              {data && data.length === 0 ? 'No hay servicios disponibles' : 'No hay datos disponibles del servicio.'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default ComponentTable;
