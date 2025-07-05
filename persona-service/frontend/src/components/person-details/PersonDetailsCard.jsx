import React from "react";
import { Fade } from "react-awesome-reveal";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User, Mail, Phone, BadgeCheck, MapPin, IdCard, Calendar, Pencil
} from "lucide-react";

function PersonDetailsCard({ person, onEdit }) {
  const campos = [
    {
      label: "Nombre completo",
      icon: User,
      value: `${person.nombre} ${person.apellido}`,
    },
    { label: "Correo electrónico", icon: Mail, value: person.email },
    {
      label: "Teléfonos",
      icon: Phone,
      value: (
        <div className="flex gap-x-6">
          <span>
            <strong>Móvil:</strong> {person.telefono_movil || "-"}
          </span>
          <span>
            <strong>Fijo:</strong> {person.telefono_fijo || "-"}
          </span>
        </div>
      ),
    },
    {
      label: "Red social",
      icon: BadgeCheck,
      value: person.red_social_nombre
        ? `${person.red_social_nombre} (${person.red_social_contacto || "sin usuario"})`
        : "Sin red social",
    },
    {
      label: "Observaciones",
      icon: BadgeCheck,
      value: person.observacion_contacto || "Sin observaciones",
    },
    {
      label: "Dirección y Ubicación",
      icon: MapPin,
      value: (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            <strong>Dirección:</strong>{" "}
            {`${person.localidad || "-"} (${person.codigo_postal || "-"}) - ${person.calle || "-"} ${person.numero || "-"} - Piso: ${person.piso || "-"} Dpto: ${person.dpto || "-"}`}
          </span>
          <span>
            <strong>Referencia:</strong>{" "}
            {person.referencia || "Sin referencia"}
          </span>
          <span>
            <strong>Partido:</strong> {person.partido || "-"}
          </span>
          <span>
            <strong>Provincia:</strong> {person.provincia || "-"}
          </span>
        </div>
      ),
    },
    {
      label: "Documento",
      icon: IdCard,
      value: (
        <div className="flex gap-x-6">
          <span>
            <strong>Tipo:</strong> {person.tipo_documento || "-"}
          </span>
          <span>
            <strong>Número:</strong> {person.documento || "-"}
          </span>
        </div>
      ),
    },
    {
      label: "Fecha de nacimiento",
      icon: Calendar,
      value: person.fecha_nacimiento || "-",
    },
    {
      label: "Fechas",
      icon: Calendar,
      value: (
        <div className="flex gap-x-6">
          <span>
            <strong>Registro:</strong> {person.fechaRegistro || "-"}
          </span>
          <span>
            <strong>Última actualización:</strong>{" "}
            {person.fechaActualizacion || "-"}
          </span>
        </div>
      ),
    },
  ];

  return (
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
          {campos.map(({ label, icon: Icon, value }) => (
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
          <Button variant="outline" onClick={onEdit}>
            <Pencil className="mr-2" /> Editar
          </Button>
        </CardFooter>
      </Card>
    </Fade>
  );
}

export default PersonDetailsCard;