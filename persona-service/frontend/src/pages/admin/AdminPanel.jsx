import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, FileText, HandPlatter } from "lucide-react";
import { Fade } from "react-awesome-reveal";
import { isAdmin } from "@/context/AuthContext";
import { useAuthContext } from "@/context/AuthContext";
import { hasAccess } from "@/routes/AuthRouteConfig";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";
/**
 * Lista de opciones disponibles en el panel de administración.
 * Cada opción incluye un título, una descripción, un ícono y la ruta correspondiente.
 * @typedef {Object} AdminOption
 * @property {string} title - Título de la opción del panel.
 * @property {string} description - Breve descripción de lo que hace la opción.
 * @property {JSX.Element} icon - Ícono representativo de la opción.
 * @property {string} path - Ruta a la que navegará al hacer clic.
 */

const adminOptions = [
  {
    title: "Personas",
    description: "Gestionar cuentas de personas",
    icon: <Users className="w-14 h-14 text-primary" />,
    path: "/adminpersons",
    hasAccess: ()=>hasAccess("/adminpersons")
  },
  {
    title: "Roles",
    description: "Administrar permisos y roles",
    icon: <ShieldCheck className="w-14 h-14 text-primary" />,
    path: "/adminroles",
    hasAccess: ()=>hasAccess("/adminroles")
  },
  {
    title: "Registros",
    description: "Ver registros del sistema",
    icon: <FileText className="w-14 h-14 text-primary" />,
    path: "/logs",
    hasAccess: ()=>hasAccess("/logs")
  },
  {
    title: "Gestión de Servicios",
    description: "Controlar y administrar servicios activos",
    icon: <HandPlatter className="w-14 h-14 text-primary" />,
    path: "/adminservices",
    hasAccess: ()=>hasAccess("/adminservices")
  },
];

/**
 * Componente `AdminPanel`.
 * Muestra un panel de administración con tarjetas para gestionar usuarios, roles y logs del sistema.
 *
 * @component
 * @returns {JSX.Element} Componente que renderiza el panel de administración.
 *
 */

const AdminPanel = () => {
  const navigate = useNavigate();
  return (
    <div className="py-6 px-4 md:py-10 md:px-10 2xl:pl-[5%] 2xl:pr-[5%]">
      <Fade duration={300} triggerOnce>
        <h2 className="text-3xl font-bold mb-10 text-center">
          Panel de Administración
        </h2>{" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {adminOptions.filter((option) => option.hasAccess()).map((option) => (
            <Card
              key={option.title}
              className="flex flex-col justify-between text-center transition-transform duration-300 ease-in-out hover:scale-103 hover:shadow-xl cursor-pointer"
              onClick={() => navigate(option.path)}
            >
              <CardHeader className="flex flex-col items-center justify-center gap-2 flex-grow">
                {option.icon}
                <CardTitle className="mt-2 text-2xl">{option.title}</CardTitle>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Button variant="default" className="mt-2 cursor-pointer ">
                  Ir a {option.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Fade>
    </div>
  );
};

export default AdminPanel;
