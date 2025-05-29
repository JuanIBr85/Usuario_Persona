
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, FileText } from "lucide-react";
import { Fade } from 'react-awesome-reveal'

const adminOptions = [
  {
    title: "Usuarios",
    description: "Gestionar cuentas de usuario",
    icon: <Users className="w-14 h-14 text-primary" />,
    path: "/adminusers",
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
];

const AdminPanel = () => {
  const navigate = useNavigate();

  return (

    <div className=" py-30 px-5 md:p-30  ">
      <Fade duration={300} triggerOnce>
        <h2 className="text-3xl font-bold mb-10 text-center">Panel de Administración</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {adminOptions.map((option) => (
            <Card
              key={option.title}
              className="text-center h-72 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => navigate(option.path)}
            >
              <CardHeader className="flex flex-col items-center justify-center h-2/3">
                {option.icon}
                <CardTitle className="mt-4 text-2xl">{option.title}</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Button
                  variant="default"
                  className="mt-2 cursor-pointer"
                >
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