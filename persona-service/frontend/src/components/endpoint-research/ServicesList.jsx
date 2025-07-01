import React from "react";
import ServiceCard from "./ServiceCard";

function ServicesList({ services, onToggleAvailable, onRemove }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mt-8 mb-4">Servicios detectados:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length > 0 ? (
          services.map((service) => (
            <ServiceCard
              key={service.id_service}
              service={service}
              onToggleAvailable={onToggleAvailable}
              onRemove={onRemove}
            />
          ))
        ) : (
          <p>No hay servicios disponibles.</p>
        )}
      </div>
    </div>
  );
}

export default ServicesList;