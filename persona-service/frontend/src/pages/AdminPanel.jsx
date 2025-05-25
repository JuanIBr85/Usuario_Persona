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

const adminOptions = [
  {
    title: "Usuarios",
    description: "Gestionar cuentas de usuario",
    icon: <Users className="w-12 h-12 text-primary" />,
    path: "/adminusers",
  },
  {
    title: "Roles",
    description: "Administrar permisos y roles",
    icon: <ShieldCheck className="w-12 h-12 text-primary" />,
    path: "/adminroles",
  },
  {
    title: "Logs",
    description: "Ver registros del sistema",
    icon: <FileText className="w-12 h-12 text-primary" />,
    path: "/logs",
  },
];

const AdminPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold mb-6">Panel de Administración</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {adminOptions.map((option) => (
          <Card key={option.title} className="text-center">
            <CardHeader className="flex flex-col items-center">
              {option.icon}
              <CardTitle className="mt-4">{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="default"
                onClick={() => navigate(option.path)}
                className="mt-4"
              >
                Ir a {option.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;