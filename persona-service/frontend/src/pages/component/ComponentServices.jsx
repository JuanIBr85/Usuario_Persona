import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading/Loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ComponentTable from "@/components/component/ComponentTable";
import { componentService } from "@/services/componentService";
import { gatewayService } from "@/services/gatewayService";
import { Link } from "react-router-dom";
import { Home, ShieldUser } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


function ComponentServices() {
  const navigate = useNavigate();

  // Lista completa de servicios
  const [services, setServices] = useState(null);

  const refreshServices = () => {
    componentService.get_all().then((response) => {
      setServices([...response.data]);
    });
  };

  const refreshGateway = () => {
    gatewayService.startResearch().then((response) => {
      console.log(response);
      alert(response.message);
    });
  };

  // Carga inicial de servicios al montar el componente
  useEffect(() => {
    refreshServices();

    const interval = setInterval(() => {
      refreshServices();
    }, 1000 * 10);

    return () => clearInterval(interval);
  }, []);

  // Muestra loader si aún no hay servicios cargados
  if (!services) return <Loading />;

  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Servicios Disponibles
            </CardTitle>
            <Button variant="outline" onClick={refreshGateway}>
              Aplicar cambios
            </Button>
          </CardHeader>
          <CardContent>
            <ComponentTable data={services} />
          </CardContent>
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
              <BreadcrumbPage className="flex items-center gap-1">
                <ShieldUser className="w-4 h-4" />
               Componentes
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>
    </div>
  );
}

export default ComponentServices;
