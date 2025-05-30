
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, FileText } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

const adminOptions = [
  {
    title: "Usuarios",
    description: "Gestionar cuentas de usuario",
    icon: <Users className="w-10 h-10 text-primary" />,
    path: "/adminusers",
  },
  {
    title: "Roles",
    description: "Administrar permisos y roles",
    icon: <ShieldCheck className="w-10 h-10 text-primary" />,
    path: "/adminroles",
  },
  {
    title: "Logs",
    description: "Ver registros del sistema",
    icon: <FileText className="w-10 h-10 text-primary" />,
    path: "/logs",
  },
];

const AdminPanel = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout 
      title="Panel de Administración"
      description="Seleccione una opción para comenzar"
    >
      <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {adminOptions.map((option) => (
          <Card
            key={option.title}
            className="group transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col cursor-pointer"
            onClick={() => navigate(option.path)}
          >
            <CardHeader className="flex-1 flex flex-col items-center justify-center pb-2">
              <div className="p-3 mb-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {option.icon}
              </div>
              <CardTitle className="text-xl">{option.title}</CardTitle>
              <CardDescription className="text-center mt-2">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <Button className="w-full">
                Administrar {option.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;