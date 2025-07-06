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
      value: `${person.nombre_persona || ''} ${person.apellido_persona || ''}`.trim() || '-',
    },
    { 
      label: "Correo electrónico", 
      icon: Mail, 
      value: person.contacto?.email_contacto || 'Sin correo electrónico' 
    },
    {
      label: "Teléfonos",
      icon: Phone,
      value: (
        <div className="flex gap-x-6">
          <span>
            <strong>Móvil:</strong> {person.contacto?.telefono_movil || "-"}
          </span>
          <span>
            <strong>Fijo:</strong> {person.contacto?.telefono_fijo || "-"}
          </span>
        </div>
      ),
    },
    {
      label: "Red social",
      icon: BadgeCheck,
      value: person.contacto?.red_social_nombre
        ? `${person.contacto.red_social_nombre} (${person.contacto.red_social_contacto || "sin usuario"})`
        : "Sin red social",
    },
    {
      label: "Observaciones",
      icon: BadgeCheck,
      value: person.contacto?.observacion_contacto || "Sin observaciones",
    },
    {
      label: "Dirección",
      icon: MapPin,
      value: (
        <div className="flex flex-col gap-1">
          <div>
            <strong>Calle:</strong> {`${person.domicilio?.domicilio_calle || 'Sin calle'} ${person.domicilio?.domicilio_numero || ''}`.trim() || '-'}
          </div>
          <div>
            <strong>Piso/Depto:</strong> {`Piso: ${person.domicilio?.domicilio_piso || '-'} - Dpto: ${person.domicilio?.domicilio_dpto || '-'}`}
          </div>
          <div>
            <strong>Localidad:</strong> {`${person.domicilio?.domicilio_postal?.localidad || '-'} (CP: ${person.domicilio?.domicilio_postal?.codigo_postal || '-'})`}
          </div>
          <div>
            <strong>Referencia:</strong> {person.domicilio?.domicilio_referencia || "Sin referencia"}
          </div>
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
            <strong>Número:</strong> {person.num_doc_persona || "-"}
          </span>
        </div>
      ),
    },
    {
      label: "Fecha de nacimiento",
      icon: Calendar,
      value: person.fecha_nacimiento_persona || "-",
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