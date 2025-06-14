import React, { useState, useEffect } from 'react';
import { Fade } from "react-awesome-reveal";
import { useParams, Link } from 'react-router-dom';

import Loading from '@/components/loading/Loading'

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
            nombre: `${persona.nombre_persona}`,
            apellido: `${persona.apellido_persona}`,

            email: persona.contacto?.email_contacto || "Sin email",
            telefono: persona.contacto?.telefono_movil || "Sin teléfono",

            calle: persona.domicilio ? persona.domicilio.domicilio_calle : "Sin dirección",
            numero: persona.domicilio ? persona.domicilio.domicilio_numero : "",
            piso: persona.domicilio ? persona.domicilio.domicilio_piso : "",
            dpto: persona.domicilio ? persona.domicilio.domicilio_dpto : "",
            referencia: persona.domicilio ? persona.domicilio.domicilio_referencia : "",
            codigo_postal: persona.domicilio ? persona.domicilio.domicilio_postal.codigo_postal : "",
            localidad: persona.domicilio ? persona.domicilio.domicilio_postal.localidad : "",
            partido: persona.domicilio ? persona.domicilio.domicilio_postal.partido : "",
            provincia: persona.domicilio ? persona.domicilio.domicilio_postal.provincia : "",

            fechaRegistro: new Date(persona.created_at).toLocaleDateString(),
            tipo_documento: persona.tipo_documento || "Tipo de documento indefinido",
            documento: `${persona.num_doc_persona}`,
          };
          setUser(userMapped);
        }
      })
      .catch(err => {
        console.error("Error al obtener la persona:", err);
      });
  }, [id]);

  const handleEditSubmit = (e) => {

    const body = {
      nombre_persona: editingUser.nombre,
      apellido_persona: editingUser.apellido,
      fecha_nacimiento_persona: "1990-05-10", // TODO
      tipo_documento: "", // TODO
      num_doc_persona: "12345678", // TODO

      domicilio: {
        domicilio_calle: editingUser.calle,
        domicilio_numero: editingUser.numero,
        domicilio_piso: editingUser.piso,
        domicilio_dpto: editingUser.dpto,
        domicilio_referencia: editingUser.referencia,
        codigo_postal: {
          codigo_postal: editingUser.codigo_postal,
          localidad: editingUser.localidad,
          partido: editingUser.partido,
          provincia: editingUser.provincia,
        },
      },

      contacto: {
        telefono_movil: editingUser.telefono,
        telefono_fijo: "",  // TODO
        red_social_contacto: "",  // TODO
        red_social_nombre: "", // TODO
        email_contacto: editingUser.email,
        observacion_contacto: "Contacto principal"
      }
    };

    e.preventDefault();
    console.log(editingUser)
    setUser(editingUser);
    setEditingUser(null);
    PersonaService.editar(id, body)
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
              { label: "Nombre completo", icon: User, value: user.nombre + " " + user.apellido },
              { label: "Correo electrónico", icon: Mail, value: user.email },
              { label: "Teléfono", icon: Phone, value: user.telefono },
              { label: "Dirección", icon: MapPin, value: user.localidad + " (" + user.codigo_postal + ") " + user.calle + " " + user.numero + " " + user.dpto },
              { label: "Fecha de Registro", icon: Calendar, value: user.fechaRegistro },
              { label: user.tipo_documento, icon: IdCard, value: user.documento },
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica los datos del usuario.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={editingUser.nombre}
                    onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={editingUser.apellido}
                    onChange={(e) => setEditingUser({ ...editingUser, apellido: e.target.value })}
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
                <div className="grid gap-2">
                  <Label htmlFor="calle">Calle</Label>
                  <Input
                    id="calle"
                    value={editingUser.calle}
                    onChange={(e) => setEditingUser({ ...editingUser, calle: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={editingUser.numero}
                    onChange={(e) => setEditingUser({ ...editingUser, numero: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="piso">Piso</Label>
                  <Input
                    id="piso"
                    value={editingUser.piso}
                    onChange={(e) => setEditingUser({ ...editingUser, piso: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dpto">Dpto</Label>
                  <Input
                    id="dpto"
                    value={editingUser.dpto}
                    onChange={(e) => setEditingUser({ ...editingUser, dpto: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referencia">Referencia</Label>
                  <Input
                    id="referencia"
                    value={editingUser.referencia}
                    onChange={(e) => setEditingUser({ ...editingUser, referencia: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={editingUser.codigo_postal}
                    onChange={(e) => setEditingUser({ ...editingUser, codigo_postal: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="localidad">Localidad</Label>
                  <Input
                    id="localidad"
                    value={editingUser.localidad}
                    onChange={(e) => setEditingUser({ ...editingUser, localidad: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partido">Partido</Label>
                  <Input
                    id="partido"
                    value={editingUser.partido}
                    onChange={(e) => setEditingUser({ ...editingUser, partido: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input
                    id="provincia"
                    value={editingUser.provincia}
                    onChange={(e) => setEditingUser({ ...editingUser, provincia: e.target.value })}
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
