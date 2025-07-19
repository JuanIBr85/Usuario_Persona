import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Trash2,
  RouteOff,
  Route,
  ShieldMinus,
  ShieldCheck,
  OctagonMinus,
  AlertCircleIcon,
  CheckCircle2Icon,
  PopcornIcon,
  Loader2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { componentService } from "@/services/componentService";

import { SimpleDialog } from "@/components/SimpleDialog";
import { formSubmitJson } from "@/utils/formUtils";
import InputValidate from "../inputValidate/InputValidate";

function ComponentTable({ data, setData }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);

  const [countdown, setCountdown] = useState(null);
  const [isStopping, setIsStopping] = useState(false);
  const [canStop, setCanStop] = useState(false);
  const [stopSystemDialogOpen, setStopSystemDialogOpen] = useState(false);

  const navigate = useNavigate();
  const handleToggleService = (id_service, state) => {
    const newState = state ? 0 : 1;

    componentService
      .set_service_available(id_service, newState)
      .then((response) => {
        console.log(response);

        setData((prevServices) =>
          prevServices.map((service) =>
            service.id_service === id_service
              ? { ...service, service_available: newState }
              : service
          )
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleDeleteService = (id_service) => {
    componentService
      .remove_service(id_service)
      .then((response) => {
        console.log("response", response);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleViewDetails = (id_service) => {
    navigate(`/adminservices/components/${id_service}`);
  };

  const handleStopSystem = async () => {
    setCountdown(30);
    setIsStopping(true);
    try {
      const response = await componentService.stop_system();
      console.log(" Sistema será detenido en 30 segundos:", response);
    } catch (error) {
      console.error(" Error al detener el sistema:", error);
    }
    setStopSystemDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    const formData = await formSubmitJson(e);
    setLoading(true);
    setResponse(null);
    componentService
      .install_service(formData.newService_url)
      .then((data) => setResponse(data))
      .catch((error) =>
        setResponse({
          status: "fail",
          message: error?.data?.message ?? "Ocurrió un error inesperado",
        })
      )
      .finally(() => {
        setLoading(false);
        setInstallDialogOpen(false);
      });
    /*try {
      const data = await componentService.install_service(
        formData.newService_url
      );
      setResponse(data);
    } catch (error) {
      let mensaje = error?.data?.message ?? "Ocurrió un error inesperado";
      setResponse({ status: "fail", message: mensaje });
    } finally {
      setLoading(false);
    }*/
  };

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanStop(true);
      clearInterval(interval);
    }
    if (countdown == 0 && isStopping == true) {
      setIsStopping(false);
    }

    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {/*<TableHead>ID</TableHead>*/}
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
                {/*<TableCell className="font-medium">
                  {service.id_service}
                </TableCell>*/}
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
                        {console.log(
                          `${service.service_name} → service_wait:`,
                          service.service_wait
                        )}
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
                                <ShieldMinus />
                              ) : (
                                <ShieldCheck />
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
                        {console.log(
                          `${service.service_name} → service_core:`,
                          service.service_core
                        )}
                        {!service.service_core && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteService(service.id_service)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
        {response && (
          <div className="grid w-full max-w-xl items-start gap-4 mt-5">
            {response.status === "fail" ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{response.message}</AlertDescription>
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
        {countdown !== null && isStopping && (
          <Alert variant="destructive" className={"mt-5"}>
            <AlertCircleIcon />
            <AlertTitle>Deteniendo todos los servicios</AlertTitle>
            <AlertDescription>
              Los servicios se detendrán en <strong>{countdown}</strong>{" "}
              segundos...
            </AlertDescription>
          </Alert>
        )}

        {/* Dialogs tanto para agregar servicio como detener los sistemas */}
        <TableCaption>
          <SimpleDialog
            title="Instalar Servicio"
            cancel="Cerrar"
            cancelHandle={() => setInstallDialogOpen(false)}
            isOpen={installDialogOpen}
            description={
              <form
                id="installServiceForm"
                onSubmit={handleSubmit}
                className="grid gap-4"
              >
                <div className="grid gap-3">
                  <InputValidate
                    id="newService_url"
                    type="url"
                    maxLength={100}
                    placeholder="https://example:port"
                    labelText="URL del servicio"
                    validatePattern="^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?$"
                    validationMessage="Por favor, ingresa una URL válida."
                    required
                  />
                </div>
              </form>
            }
            actionHandle={() => {
              const form = document.getElementById("installServiceForm");
              const submitEvent = new Event("submit", {
                cancelable: true,
                bubbles: true,
              });
              form.dispatchEvent(submitEvent);
            }}
          />

          <SimpleDialog
            title="Detener todos los servicios"
            description="¿Está seguro que quiere detener todos los servicios?"
            action={canStop ? "Detener" : `Esperando ${countdown}s...`}
            cancel="Cerrar"
            actionHandle={async () => canStop && handleStopSystem()}
            cancelHandle={() => setStopSystemDialogOpen(false)}
            isOpen={stopSystemDialogOpen}
            actionDisabled={!canStop}
          />
          <div className="flex justify-between w-full">
            {/* Botones de agregar y de detener el sistema */}
            <Button
              variant=""
              className={"mt-5 cursor-pointer"}
              onClick={() => setInstallDialogOpen(true)}
            >
              {" "}
              <Plus /> Instalar Servicio
            </Button>
            <Button
              disabled={isStopping}
              variant="destructive"
              className={"mt-5 cursor-pointer"}
              onClick={() => {
                setCountdown(3);
                setCanStop(false);
                setStopSystemDialogOpen(true);
              }}
            >
              <OctagonMinus /> Detener todo el sistema
            </Button>
          </div>
        </TableCaption>
      </Table>
    </>
  );
}

export default ComponentTable;
