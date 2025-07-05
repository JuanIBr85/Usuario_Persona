import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { componentService } from "@/services/componentService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, ShieldUser ,Search, Wrench, Eye} from "lucide-react";
import { Fade } from "react-awesome-reveal";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function ComponentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await componentService.get_by_id(id);
        setDetails(response.data);
      } catch (error) {
        console.error("Error fetching component details:", error);
      }
    };

    fetchDetails();
  }, [id]);

  if (!details) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Cargando detalles...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 py-15 px-3 md:py-10 md:px-15">
      <Fade duration={300} triggerOnce>
        <h1 className="text-3xl font-bold text-center">
          Detalles del Componente
        </h1>

        <Card className="shadow-md max-w-2xl mx-auto p-6 space-y-6 mb-10">
          <CardHeader>
            <CardTitle className="text-xl">{details.service_name}</CardTitle>
            <CardDescription>{details.service_description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-semibold">ID:</span> {details.id_service}
            </div>
            <div>
              <span className="font-semibold">URL:</span>{" "}
              <a
                href={details.service_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {details.service_url}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={details.health ? "default" : "destructive"}>
                {details.health ? "Activo" : "Inactivo"}
              </Badge>
              <Badge
                variant={details.service_available ? "outline" : "secondary"}
                className={
                  details.service_available ? "text-green-600" : "text-red-600"
                }
              >
                {details.service_available ? "Disponible" : "No Disponible"}
              </Badge>
              {details.service_core && (
                <Badge variant="secondary">Servicio Core</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Última actualización:{" "}
              {new Date(details.updated_at).toLocaleString()}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </CardFooter>
        </Card>
        <Breadcrumb className="mt-auto self-start ">
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
              <BreadcrumbLink asChild>
                <Link
                  to="/adminservices/components"
                  className="flex items-center gap-1"
                >
                  <Wrench className="w-4 h-4" />
                  Servicios Disponibles
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                Detalles del Componente
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>
    </div>
  );
}

export default ComponentDetails;
