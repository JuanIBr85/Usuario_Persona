import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShieldMinus, ShieldCheck, Trash2 } from "lucide-react";

function ServiceCard({ service, onToggleAvailable, onRemove }) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{service.service_name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <p><strong>ID:</strong> {service.id_service}</p> */}
        <p><strong>Descripción:</strong> {service.service_description}</p>
        <p><strong>URL:</strong> {service.service_url}</p>
        <p>
          <strong>Estado:</strong>{" "}
          <span className={`px-2 py-1 rounded-full text-xs ${service.health ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {service.health ? "Activo" : "Inactivo"}
          </span>
        </p>
        <p>
          <strong>Disponible:</strong>{" "}
          <span className={`px-2 py-1 rounded-full text-xs ${service.service_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {service.service_available ? "Sí" : "No"}
          </span>
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleAvailable(service.id_service, service.service_available)}
        >
          {service.service_available ? (
            <div className="cursor-pointer">
              <ShieldMinus className="inline w-4 h-4 mr-1" /> Desactivar
            </div>
          ) : (
            <div className="cursor-pointer">
              <ShieldCheck className="inline w-4 h-4 mr-1 cursor-pointer" /> Activar
            </div>
          )}
        </Button>
        {!service.service_core && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(service.id_service)}
          >
            <Trash2 className="inline w-4 h-4 mr-1" /> Eliminar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ServiceCard;