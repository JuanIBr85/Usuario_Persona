import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import { useParams, Link } from "react-router-dom";

import Loading from "@/components/loading/Loading";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Pencil,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  Calendar,
  IdCard,
  DollarSign,
  Home,
  ChevronRight,
  BookUser,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Servicio
import { PersonaService } from "@/services/personaService";

function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [redesSociales, setRedesSociales] = useState([]);
  const [tiposDocumentos, setTiposDocumentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  useEffect(() => {
    PersonaService.get_by_id(id)
      .then((res) => {
        console.log("Respuesta completa:", res);
        if (res?.data) {
          const persona = res.data;

          const userMapped = {
            id: persona.id_persona,
            usuario_id: persona.usuario_id || null,

            nombre: persona.nombre_persona || "",
            apellido: persona.apellido_persona || "",

            tipo_documento:
              persona.tipo_documento || "Tipo de documento indefinido",
            documento: persona.num_doc_persona || "",

            fecha_nacimiento: persona.fecha_nacimiento_persona || "",
            fechaRegistro: new Date(persona.created_at).toLocaleDateString(),
            fechaActualizacion: new Date(
              persona.updated_at
            ).toLocaleDateString(),
            eliminado: persona.deleted_at !== null,

            // Contacto
            email: persona.contacto?.email_contacto || "Sin email",
            telefono_movil: persona.contacto?.telefono_movil || "Sin móvil",
            telefono_fijo: persona.contacto?.telefono_fijo || "Sin fijo",
            red_social_nombre:
              persona.contacto?.red_social_nombre || "Sin red social",
            red_social_contacto:
              persona.contacto?.red_social_contacto ||
              "Sin nombre de usuario en red",
            observacion_contacto: persona.contacto?.observacion_contacto || "",

            // Domicilio
            calle: persona.domicilio?.domicilio_calle || "Sin dirección",
            numero: persona.domicilio?.domicilio_numero || "",
            piso: persona.domicilio?.domicilio_piso || "",
            dpto: persona.domicilio?.domicilio_dpto || "",
            referencia: persona.domicilio?.domicilio_referencia || "",
            codigo_postal:
              persona.domicilio?.domicilio_postal?.codigo_postal || "",
            localidad: persona.domicilio?.domicilio_postal?.localidad || "",
            partido: persona.domicilio?.domicilio_postal?.partido || "",
            provincia: persona.domicilio?.domicilio_postal?.provincia || "",
            domicilio_id: persona.domicilio?.id_domicilio || null,
            domicilio_cp_id: persona.domicilio?.codigo_postal_id || null,
          };
          setUser(userMapped);
        }
      })
      .catch((err) => {
        console.error("Error al obtener la persona:", err);
      });
  }, [id]);

  useEffect(() => {
    PersonaService.get_redes_sociales().then((res) => {
      setRedesSociales(res?.data || []);
    });
    PersonaService.get_tipos_documentos().then((res) => {
      setTiposDocumentos(res?.data || []);
    });
  }, []);
  console.log("get_tipos_documentos", tiposDocumentos);

  useEffect(() => {
    if (editingUser?.codigo_postal?.length >= 4) {
      PersonaService.get_localidades_by_codigo_postal(
        editingUser.codigo_postal
      ).then((res) => {
        setLocalidades(res?.data || []);
        console.log("localidades", res?.data || []);
      });
    }
  }, [editingUser?.codigo_postal]);

  const handleEditSubmit = async (e) => {
    const body = {
      nombre_persona: editingUser.nombre,
      apellido_persona: editingUser.apellido,
      tipo_documento: editingUser.tipo_documento || "",
      num_doc_persona: editingUser.documento || "",
      fecha_nacimiento_persona: editingUser.fecha_nacimiento || "",

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
        telefono_movil: editingUser.telefono_movil || "",
        telefono_fijo: editingUser.telefono_fijo || "",
        red_social_contacto: editingUser.red_social_contacto || null,
        red_social_nombre: editingUser.red_social_nombre || null,
        email_contacto: editingUser.email || "",
      },
    };

    e.preventDefault();
    console.log(editingUser);
    setUser(editingUser);
    setEditingUser(null);
    PersonaService.editar(id, body);
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
              <User /> Perfil de Persona
            </CardTitle>
            <CardDescription>
              Información detallada de la persona.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {[
              {
                label: "Nombre completo",
                icon: User,
                value: `${user.nombre} ${user.apellido}`,
              },
              { label: "Correo electrónico", icon: Mail, value: user.email },
              {
                label: "Teléfonos",
                icon: Phone,
                value: (
                  <div className="flex gap-x-6">
                    <span>
                      <strong>Móvil:</strong> {user.telefono_movil || "-"}
                    </span>
                    <span>
                      <strong>Fijo:</strong> {user.telefono_fijo || "-"}
                    </span>
                  </div>
                ),
              },
              {
                label: "Red social",
                icon: BadgeCheck,
                value: user.red_social_nombre
                  ? `${user.red_social_nombre} (${
                      user.red_social_contacto || "sin usuario"
                    })`
                  : "Sin red social",
              },
              {
                label: "Observaciones",
                icon: BadgeCheck,
                value: user.observacion_contacto || "Sin observaciones",
              },

              {
                label: "Dirección y Ubicación",
                icon: MapPin,
                value: (
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      <strong>Dirección:</strong>{" "}
                      {`${user.localidad || "-"} (${
                        user.codigo_postal || "-"
                      }) - ${user.calle || "-"} ${user.numero || "-"} - Piso: ${
                        user.piso || "-"
                      } Dpto: ${user.dpto || "-"}`}
                    </span>
                    <span>
                      <strong>Referencia:</strong>{" "}
                      {user.referencia || "Sin referencia"}
                    </span>
                    <span>
                      <strong>Partido:</strong> {user.partido || "-"}
                    </span>
                    <span>
                      <strong>Provincia:</strong> {user.provincia || "-"}
                    </span>
                  </div>
                ),
              },

              {
                // Grupo: Tipo de documento y Número de documento en la misma línea
                label: "Documento",
                icon: IdCard,
                value: (
                  <div className="flex gap-x-6">
                    <span>
                      <strong>Tipo:</strong> {user.tipo_documento || "-"}
                    </span>
                    <span>
                      <strong>Número:</strong> {user.documento || "-"}
                    </span>
                  </div>
                ),
              },

              {
                label: "Fecha de nacimiento",
                icon: Calendar,
                value: user.fecha_nacimiento || "-",
              },

              {
                // Grupo: Fecha de registro y Última actualización en la misma línea
                label: "Fechas",
                icon: Calendar,
                value: (
                  <div className="flex gap-x-6">
                    <span>
                      <strong>Registro:</strong> {user.fechaRegistro || "-"}
                    </span>
                    <span>
                      <strong>Última actualización:</strong>{" "}
                      {user.fechaActualizacion || "-"}
                    </span>
                  </div>
                ),
              },
            ].map(({ label, icon: Icon, value }) => (
              <div
                key={label}
                className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-4 border-b pb-4"
              >
                <span className="text-sm text-gray-500 font-medium inline-flex items-center gap-1">
                  <Icon className="w-4 h-4" /> {label}
                </span>
                <span className="sm:col-span-2 text-sm text-gray-900">
                  {value}
                </span>
              </div>
            ))}
          </CardContent>

          <CardFooter className="justify-start">
            <Button
              variant="outline"
              onClick={() => setEditingUser({ ...user })}
            >
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
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/adminusers" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Panel de Usuarios
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="flex items-center gap-1">
              <BookUser className="w-4 h-4" />
              <BreadcrumbPage>Detalles del Usuario</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>

      {/* Dialog de edición */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={editingUser.nombre}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, nombre: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={editingUser.apellido}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        apellido: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                  
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={editingUser.telefono_movil}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        telefono_movil: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="calle">Calle</Label>
                  <Input
                    id="calle"
                    value={editingUser.calle}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, calle: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={editingUser.numero}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, numero: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="piso">Piso</Label>
                  <Input
                    id="piso"
                    value={editingUser.piso}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, piso: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dpto">Dpto</Label>
                  <Input
                    id="dpto"
                    value={editingUser.dpto}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, dpto: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referencia">Referencia</Label>
                  <Input
                    id="referencia"
                    value={editingUser.referencia}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        referencia: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={editingUser.codigo_postal}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        codigo_postal: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="localidad">Localidad</Label>
                  {localidades.length > 0 ? (
                    <select
                      id="localidad"
                      className="border rounded px-2 py-1"
                      value={editingUser.localidad}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          localidad: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccionar localidad</option>
                      {localidades.map((loc, index) => (
                        <option key={index} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="localidad"
                      value={editingUser.localidad}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          localidad: e.target.value,
                        })
                      }
                    />
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="partido">Partido</Label>
                  <Input
                    id="partido"
                    value={editingUser.partido}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        partido: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input
                    id="provincia"
                    value={editingUser.provincia}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        provincia: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={editingUser.fecha_nacimiento || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tipo_documento">Tipo de documento</Label>
                  <select
                    id="tipo_documento"
                    className="border rounded px-2 py-1"
                    value={editingUser.tipo_documento || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        tipo_documento: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposDocumentos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="documento">Número de Documento</Label>
                  <Input
                    id="documento"
                    value={editingUser.documento || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        documento: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="red_social_nombre">Red Social</Label>
                  <select
                    id="red_social_nombre"
                    className="border rounded px-2 py-1"
                    value={editingUser.red_social_nombre || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        red_social_nombre: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar red</option>
                    {redesSociales.map((red) => (
                      <option key={red} value={red}>
                        {red}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="red_social_contacto">
                    Usuario de Red Social
                  </Label>
                  <Input
                    id="red_social_contacto"
                    value={editingUser.red_social_contacto || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        red_social_contacto: e.target.value,
                      })
                    }
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
