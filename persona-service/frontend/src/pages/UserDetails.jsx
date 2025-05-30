import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, User, Shield, BadgeCheck, Clock, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

const UserDetails = () => {
  const { id } = useParams();
  
  // Mock data - replace with actual API call
  const [user, setUser] = useState({
    id: 1,
    nombre: "Juan Pérez",
    rol: "Profesor",
    email: "juan.perez@email.com",
    status: "Activo",
    telefono: "(011) 1234-5678",
    direccion: "Av. Corrientes 1234\nCABA, Argentina 1043",
    avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=0ea5e9&color=fff",
    fechaRegistro: "15/03/2023",
    ultimoAcceso: "Hace 2 horas",
    permisos: ["Gestionar cursos", "Ver reportes", "Editar contenido"]
  });

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <BadgeCheck className="w-3 h-3 mr-1" /> Activo
        </Badge>;
      case 'inactivo':
        return <Badge variant="secondary">Inactivo</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" /> Pendiente
        </Badge>;
      case 'bloqueado':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" /> Bloqueado
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      'administrador': 'bg-purple-100 text-purple-800',
      'profesor': 'bg-blue-100 text-blue-800',
      'alumno': 'bg-green-100 text-green-800',
      'editor': 'bg-yellow-100 text-yellow-800',
    };
    
    const colorClass = roleColors[role.toLowerCase()] || 'bg-gray-100 text-gray-800';
    
    return (
      <Badge className={`${colorClass} hover:opacity-90`}>
        <Shield className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  const userInfo = [
    { 
      label: 'Correo electrónico', 
      value: user.email,
      icon: <Mail className="w-4 h-4 text-muted-foreground" />
    },
    { 
      label: 'Teléfono', 
      value: user.telefono,
      icon: <Phone className="w-4 h-4 text-muted-foreground" />
    },
    { 
      label: 'Dirección', 
      value: user.direccion,
      icon: <MapPin className="w-4 h-4 text-muted-foreground" />,
      multiline: true
    },
    { 
      label: 'Fecha de registro', 
      value: user.fechaRegistro,
      icon: <Clock className="w-4 h-4 text-muted-foreground" />
    },
    { 
      label: 'Último acceso', 
      value: user.ultimoAcceso,
      icon: <Clock className="w-4 h-4 text-muted-foreground" />
    }
  ];

  return (
    <AdminLayout 
      title="Detalles de Usuario"
      description="Información detallada del perfil del usuario"
    >
      <AdminBreadcrumb items={[
        { label: "Usuarios", href: "/adminusers" },
        { label: user.nombre }
      ]} />

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={user.avatar} alt={user.nombre} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{user.nombre}</h2>
                    {getStatusBadge(user.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(user.rol)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/adminusers">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Usuarios
                  </Link>
                </Button>
                <Button size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Información Personal
                </h3>
                <div className="space-y-4">
                  {userInfo.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-5 text-muted-foreground">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {item.label}
                        </p>
                        {item.multiline ? (
                          <p className="text-sm whitespace-pre-line">
                            {item.value}
                          </p>
                        ) : (
                          <p className="text-sm">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Permisos y Roles
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-5 text-muted-foreground">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Rol Principal
                      </p>
                      <div>
                        {getRoleBadge(user.rol)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-5 text-muted-foreground">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Permisos Adicionales
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {user.permisos && user.permisos.length > 0 ? (
                          user.permisos.map((permiso, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {permiso}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Sin permisos adicionales
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                    Estado de la Cuenta
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <span className="text-sm font-medium">
                        {getStatusBadge(user.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Verificación de correo:</span>
                      <Badge variant="outline" className="text-green-700 bg-green-50">
                        Verificado
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Autenticación de dos factores:</span>
                      <Badge variant="outline" className="text-amber-700 bg-amber-50">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to="/adminusers">
              Volver
            </Link>
          </Button>
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Enviar Mensaje
          </Button>
          <Button>
            <User className="w-4 h-4 mr-2" />
            Editar Usuario
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDetails;