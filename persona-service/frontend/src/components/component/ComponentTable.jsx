import React from "react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Pencil,
  MoreVertical,
  Activity,
  CirclePause,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { componentService } from "@/services/componentService";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ComponentTable({ data }) {
  const [formData, setFormData] = useState({
    newService_url: "",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleToggleService = (id_service, state) => {
    componentService
      .set_service_available(id_service, state ? 0 : 1)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleDeleteService = (id_service) => {
    componentService
      .delete_service(id_service)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleViewDetails = (id_service) => {
    navigate(`/adminservices/components/${id_service}`);
  };

  const handleChange = (e) => {
    setFormData({ newService_url: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(
        "http://localhost:5002/api/control/services/install_service",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ url: formData.newService_url }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setResponse({ error: data.message || "Error desconocido" });
      } else {
        setResponse(data);
      }
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
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
              <TableCell className="font-medium">
                {service.id_service}
              </TableCell>
              <TableCell>{service.service_name}</TableCell>
              <TableCell>{service.service_description}</TableCell>
              <TableCell>{service.service_url}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    service.health
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {service.health ? "Activo" : "Inactivo"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    service.service_available
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {service.service_available ? "Sí" : "No"}
                </span>
              </TableCell>
              <TableCell>
                {new Date(service.updated_at).toLocaleString()}
              </TableCell>
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
                      {/* ✅ Ver detalles */}
                      <DropdownMenuItem
                        onClick={() => handleViewDetails(service.id_service)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Ver detalles</span>
                      </DropdownMenuItem>

                      {/* Activar/Desactivar */}
                      {!service.service_wait && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleToggleService(
                              service.id_service,
                              service.service_available
                            )
                          }
                        >
                          <span className="mr-2">
                            {service.service_available ? (
                              <CirclePause />
                            ) : (
                              <Activity />
                            )}
                          </span>
                          <span>
                            {service.service_available
                              ? "Desactivar"
                              : "Activar"}
                          </span>
                        </DropdownMenuItem>
                      )}

                      {/* Eliminar */}
                      {!service.service_core && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteService(service.id_service)
                          }
                        >
                          <span className="mr-2">🗑️</span>
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              {data && data.length === 0
                ? "No hay servicios disponibles"
                : "No hay datos disponibles del servicio."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className={"mt-5"}>
            {" "}
            <Plus /> Instalar Servicio
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Instalar Servicio</DialogTitle>
            <DialogDescription>Instalar Servicio</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Datos personales */}
            <div className="grid gap-3">
              <Label>URL</Label>
              <Input
                name="nombre"
                value={formData.newService_url || ""}
                onChange={handleChange}
              />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">Guardar</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {response && (
        <div className="grid w-full max-w-xl items-start gap-4 mt-5">
          {response.error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{response.error}</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>
                {response.message || "Servicio instalado correctamente."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Table>
  );
}

export default ComponentTable;
