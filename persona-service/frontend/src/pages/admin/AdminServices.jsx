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
import { Home, ShieldUser, MonitorCog, MonitorCheck } from "lucide-react";
import { Fade } from "react-awesome-reveal";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * @file AdminServices.jsx
 * @description Página de administración para la gestión de servicios en el panel de administrador.
 * Permite navegar a la gestión de servicios disponibles y al monitoreo de endpoints.
 * Incluye navegación mediante tarjetas interactivas y breadcrumbs para mejorar la experiencia de usuario.
 *
 * @component
 * @returns {JSX.Element} Renderiza la interfaz de gestión de servicios para administradores.
 *
 * @dependencies
 * - React
 * - useNavigate (react-router-dom)
 * - Link (react-router-dom)
 * - Fade (animación)
 * - Card, CardHeader, CardTitle, CardDescription, CardFooter (componentes UI)
 * - Button (componente UI)
 * - Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage (componentes UI)
 * - Home, ShieldUser (iconos)
 *
 * @example
 * // Uso dentro de una ruta protegida para administradores:
 * <Route path="/adminservices" element={<AdminServices />} />
 */
function AdminServices() {
  const navigate = useNavigate();

  const options = [
    {
      icon : <MonitorCheck className="w-6 h-6" />,
      title: "Servicios Disponibles",
      description: "Controlar el servicio de componentes",
      path: "/adminservices/components",
    },
    {
      icon : <MonitorCog className="w-6 h-6" />,
      title: "Monitoreo de Servicios",
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
                  <CardTitle className="flex items-center gap-2">{opt.icon} {opt.title}</CardTitle>
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
