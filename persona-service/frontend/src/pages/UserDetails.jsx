import React, { useState, useEffect } from 'react';
import { Fade } from "react-awesome-reveal";
import { useParams, Link } from 'react-router-dom';

import Loading from '../components/loading/Loading'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User, Pencil, Mail, Phone, MapPin, BadgeCheck,
  Calendar, IdCard, DollarSign, Home, ChevronRight, BookUser
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Servicio
import { PersonaService } from "@/services/personaService";

function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    PersonaService.get_by_id(id)
      .then(res => {
        console.log("Respuesta completa:", res);
        if (res?.data) {
          const persona = res.data;
          const userMapped = {
            id: persona.id_persona,
            nombre: `${persona.nombre_persona} ${persona.apellido_persona}`,
            rol: "No definido",
            email: persona.email || "sin email",
            telefono: persona.contacto?.telefono_movil || "sin teléfono",
            direccion: persona.domicilio
              ? `${persona.domicilio.domicilio_calle} ${persona.domicilio.domicilio_numero}, Piso ${persona.domicilio.domicilio_piso}, Dpto ${persona.domicilio.domicilio_dpto}`
              : "Sin dirección",
            fechaRegistro: new Date(persona.created_at).toLocaleDateString(),
            dni: `${persona.tipo_documento} ${persona.num_doc_persona}`,
            beca: "No aplica",
            status: "Activo"
          };
          setUser(userMapped);
        }
      })
      .catch(err => {
        console.error("Error al obtener la persona:", err);
      });
  }, [id]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUser(editingUser);
    setEditingUser(null);
  };

  if (!user) {
    return <Loading></Loading>;
  }

  return (
    <div className="p-6 space-y-6">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-1">
              <User /> Perfil de Usuario
            </CardTitle>
            <CardDescription>Información detallada del usuario.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {[
              { label: "Nombre completo", icon: User, value: user.nombre },
              { label: "Correo electrónico", icon: Mail, value: user.email },
              { label: "Teléfono", icon: Phone, value: user.telefono },
              { label: "Dirección", icon: MapPin, value: user.direccion },
              { label: "Rol", icon: BadgeCheck, value: user.rol },
              { label: "Status", icon: BadgeCheck, value: user.status },
              { label: "Fecha de Registro", icon: Calendar, value: user.fechaRegistro },
              { label: "DNI", icon: IdCard, value: user.dni },
              { label: "¿Cobra beca?", icon: DollarSign, value: user.beca }
            ].map(({ label, icon: Icon, value }) => (
              <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4 border-b pb-4">
                <span className="text-sm text-gray-500 font-medium inline-flex items-center gap-1">
                  <Icon className="w-4 h-4" /> {label}
                </span>
                <span className="sm:col-span-2 text-sm text-gray-900">{value}</span>
              </div>
            ))}
          </CardContent>

          <CardFooter className="justify-start">
            <Button variant="outline" onClick={() => setEditingUser({ ...user })}>
              <Pencil className="mr-2" /> Editar
            </Button>
          </CardFooter>
        </Card>

        <Breadcrumb className="mt-auto self-start">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/adminpanel" className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Panel De Administrador
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/adminusers" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Panel de Usuarios
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
            <BreadcrumbItem className="flex items-center gap-1">
              <BookUser className="w-4 h-4" />
              <BreadcrumbPage>Detalles del Usuario</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>

      {/* Dialog de edición */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica los datos del usuario.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    value={editingUser.nombre}
                    onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={editingUser.telefono}
                    onChange={(e) => setEditingUser({ ...editingUser, telefono: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserDetails;
