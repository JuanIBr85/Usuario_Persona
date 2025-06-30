/**
 * Componente `EndpointsResearch`.
 * Este componente permite:
 *  - Iniciar y detener una investigación de endpoints de servicios registrados.
 *  - Mostrar el estado de dicha investigación en una tabla.
 *  - Listar los servicios detectados con su información y opciones para activar/desactivar o eliminar.
 *  - Mostrar errores en un diálogo emergente.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, ShieldUser, Eye, ShieldMinus, ShieldCheck, Trash2, Loader2 } from "lucide-react";

// UI Components
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card, CardContent, CardHeader,
  CardTitle, CardFooter,
} from "@/components/ui/card";

import { gatewayService } from "@/services/gatewayService";
import { traducirRateLimitMessage } from "@/utils/traductores";

function EndpointsResearch() {
  // Estados
  const [status, setStatus] = useState(null); // Estado general de la investigación
  const [services, setServices] = useState([]); // Lista de servicios detectados
  const [loading, setLoading] = useState(false); // Indica si está en progreso
  const [dialogMessage, setDialogMessage] = useState(""); // Mensaje para el diálogo
  const [openDialog, setOpenDialog] = useState(false); // Estado del diálogo de error

  /**
   * Obtener estado actual de la investigación desde el backend.
   */
  const fetchStatus = async () => {
    try {
      const res = await gatewayService.getResearchStatus();
      setStatus(res);
    } catch (error) {
      const rawMsg = error?.data?.message || error?.message || "Error desconocido.";
      const msg = traducirRateLimitMessage(rawMsg);
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  /**
   * Obtener todos los servicios detectados.
   */
  const fetchServices = async () => {
    try {
      const res = await gatewayService.getAllServices();
      setServices(res?.data || []);
    } catch (error) {
      const msg = error?.data?.message || error?.message || "Error desconocido.";
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  /**
   * Inicia el proceso de investigación.
   */
  const startResearch = async () => {
    try {
      setLoading(true);
      await gatewayService.startResearch();
      await fetchStatus();
      await fetchServices();
    } catch (error) {
      const rawMsg = error?.data?.message || error?.message || "Error desconocido.";
      const msg = traducirRateLimitMessage(rawMsg);
      setDialogMessage(msg);
      setOpenDialog(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Detiene la investigación de endpoints.
   */
  const stopResearch = async () => {
    try {
      await gatewayService.stopResearch();
      await fetchStatus();
    } catch (error) {
      const rawMsg = error?.data?.message || error?.message || "Error desconocido.";
      const msg = traducirRateLimitMessage(rawMsg);
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  /**
   * Cambia la disponibilidad de un servicio (activar/desactivar).
   * @param {string} id - ID del servicio.
   * @param {boolean} currentState - Estado actual de disponibilidad.
   */
  const toggleServiceAvailable = async (id, currentState) => {
    try {
      const newState = currentState ? 0 : 1;
      await gatewayService.setServiceAvailable(id, newState);
      setServices((prev) =>
        prev.map((s) =>
          s.id_service === id ? { ...s, service_available: newState } : s
        )
      );
    } catch (error) {
      const msg = error?.data?.message || error?.message || "Error desconocido.";
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  /**
   * Elimina un servicio que no sea de tipo core.
   * @param {string} id - ID del servicio.
   */
  const removeService = async (id) => {
    try {
      await gatewayService.removeService(id);
      setServices((prev) => prev.filter((s) => s.id_service !== id));
    } catch (error) {
      const msg = error?.data?.message || error?.message || "Error desconocido.";
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  // Efecto inicial para cargar estado y servicios
  useEffect(() => {
    fetchStatus();
    fetchServices();
  }, []);

  return (
    <div className="p-6 space-y-6 py-15 px-3 md:py-10 md:px-15">
      {/* Botones de acción */}
      <div className="flex gap-4">
        <Button onClick={startResearch} disabled={loading}>
          {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
          {loading ? "Cargando..." : "Iniciar investigación"}
        </Button>

        <Button variant="secondary" onClick={stopResearch}>
          Detener investigación
        </Button>
      </div>

      {/* Estado de investigación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye />
            Estado de investigación:
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status?.data?.log ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Endpoints encontrados</TableHead>
                  <TableHead>En progreso</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(status.data.log).map(([serviceName, info]) => (
                  <TableRow key={serviceName}>
                    <TableCell>{serviceName}</TableCell>
                    <TableCell>{info.endpoints_count}</TableCell>
                    <TableCell>{info.in_progress ? "Sí" : "No"}</TableCell>
                    <TableCell>{new Date(info.start_time * 1000).toLocaleString()}</TableCell>
                    <TableCell>{info.success ? "Éxito" : "Falló"}</TableCell>
                    <TableCell className="text-red-600">{info.error || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No hay datos de investigación disponibles.</p>
          )}
        </CardContent>
      </Card>

      {/* Lista de servicios */}
      <div>
        <h2 className="text-xl font-semibold mt-8 mb-4">Servicios detectados:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length > 0 ? (
            services.map((service) => (
              <Card key={service.id_service} className="shadow-md">
                <CardHeader>
                  <CardTitle>{service.service_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>ID:</strong> {service.id_service}</p>
                  <p><strong>Descripción:</strong> {service.service_description}</p>
                  <p><strong>URL:</strong> {service.service_url}</p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    <span className={`px-2 py-1 rounded-full text-xs ${service.health ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {service.health ? "Activo" : "Inactivo"}
                    </span>
                  </p>
                  <p>
                    <strong>Disponible:</strong>{" "}
                    <span className={`px-2 py-1 rounded-full text-xs ${service.service_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {service.service_available ? "Sí" : "No"}
                    </span>
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleServiceAvailable(service.id_service, service.service_available)}
                  >
                    {service.service_available ? (
                      <>
                        <ShieldMinus className="inline w-4 h-4 mr-1" /> Desactivar
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="inline w-4 h-4 mr-1" /> Activar
                      </>
                    )}
                  </Button>
                  {!service.service_core && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeService(service.id_service)}
                    >
                      <Trash2 className="inline w-4 h-4 mr-1" /> Eliminar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <p>No hay servicios disponibles.</p>
          )}
        </div>
      </div>

      {/* Diálogo de error */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setOpenDialog(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Migas de pan (navegación jerárquica) */}
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
              Monitoreo de Endpoints
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export default EndpointsResearch;
