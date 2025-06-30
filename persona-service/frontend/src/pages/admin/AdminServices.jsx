import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Home, ShieldUser } from "lucide-react";
import { Fade } from "react-awesome-reveal";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function AdminServices() {
  const navigate = useNavigate();

  const options = [
    {
      title: "Servicios Disponibles",
      description: "Controlar el servicio de componentes",
      path: "/adminservices/components",
    },
    {
      title: "Monitoreo de Endpoints",
      description: "Iniciar y controlar el análisis de servicios registrados.",
      path: "/adminservices/endpoints-research",
    },
  ];

  return (
    <div className="p-6 space-y-6 py-15  px-3 md:py-10 md:px-20 md:pt-10">
      <Fade duration={300} triggerOnce>
        <h2 className="text-3xl font-bold mb-6 text-center ">
          Gestión de Servicios
        </h2>
        <div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 place-items-stretch mb-5 cursor-pointer">
            {options.map((opt) => (
              <Card
                key={opt.title}
                className="flex flex-col justify-between h-60"
                onClick={() => navigate(opt.path)}
              >
                <CardHeader>
                  <CardTitle>{opt.title}</CardTitle>
                  <CardDescription>{opt.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="mt-auto w-full cursor-pointer">Ir a {opt.title}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

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
                <BreadcrumbPage className="flex items-center gap-1">
                  <ShieldUser className="w-4 h-4" />
                  Gestión de Servicios
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </Fade>
    </div>
  );
}

export default AdminServices;
