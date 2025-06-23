import React, { useEffect } from "react";
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
  },
  {
    title: "Roles",
    description: "Administrar permisos y roles",
    icon: <ShieldCheck className="w-14 h-14 text-primary" />,
    path: "/adminroles",
  },
  {
    title: "Logs",
    description: "Ver registros del sistema",
    icon: <FileText className="w-14 h-14 text-primary" />,
    path: "/logs",
  },
  {
    title: "Gestión de Servicios",
    description: "Controlar y administrar servicios activos",
    icon: <HandPlatter className="w-14 h-14 text-primary" />,
    path: "/adminservices",
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

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/profile");
      console.log('usuario no es admin')
    }
  }, [navigate]);

  return (
    <div className=" py-30 px-5 md:py-20 md:px-10 2xl:pl-[5%] 2xl:pr-[5%]">
      <Fade duration={300} triggerOnce>
        <h2 className="text-3xl font-bold mb-10 text-center">
          Panel de Administración
        </h2>{" "}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 justify-center place-items-stretch auto-rows-[18rem]">
          {adminOptions.map((option) => (
            <Card
              key={option.title}
              className="flex flex-col justify-between text-center transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer"
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
                <Button variant="default" className="mt-2 cursor-pointer">
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
