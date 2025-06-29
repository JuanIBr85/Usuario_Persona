import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { gatewayService } from '@/services/gatewayService';

function EndpointsResearch() {
  const [status, setStatus] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    const res = await gatewayService.getResearchStatus();
    setStatus(res);
  };

  const fetchServices = async () => {
    const res = await gatewayService.getAllServices();
    setServices(res?.data || []);
  };

  const startResearch = async () => {
    setLoading(true);
    await gatewayService.startResearch();
    await fetchStatus();
    await fetchServices();
    setLoading(false);
  };

  const stopResearch = async () => {
    await gatewayService.stopResearch();
    await fetchStatus();
  };

  useEffect(() => {
    fetchStatus();
    fetchServices();
  }, []);

  return (
    <div className='p-6 space-y-6'>
      <div className="flex gap-4">
        <Button onClick={startResearch} disabled={loading}>Iniciar investigación</Button>
        <Button variant="secondary" onClick={stopResearch}>Detener investigación</Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-4">Estado de investigación:</h2>
        {status?.data?.log && Object.entries(status.data.log).map(([serviceName, info]) => (
          <Card key={serviceName} className="mb-4">
            <CardHeader>
              <CardTitle>{serviceName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Endpoints encontrados:</strong> {info.endpoints_count}</p>
              <p><strong>En progreso:</strong> {info.in_progress ? 'Sí' : 'No'}</p>
              <p><strong>Inicio:</strong> {new Date(info.start_time * 1000).toLocaleString()}</p>
              <p><strong>Estado:</strong> {info.success}</p>
              {info.error && <p className="text-red-500"><strong>Error:</strong> {info.error}</p>}
            </CardContent>
          </Card>
        ))}

      </div>

      <div>
        <h2 className="text-xl font-semibold mt-4">Servicios detectados:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {services.map(service => (
            <Card key={service.id_service}>
              <CardHeader>
                <CardTitle>{service.service_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>ID:</strong> {service.id_service}</p>
                <p><strong>Estado:</strong> {service.health ? "🟢 Saludable" : "🔴 Con fallos"}</p>
                <p><strong>Disponible:</strong> {service.service_available ? "Sí" : "No"}</p>
                <p><strong>URL:</strong> {service.service_url}</p>
                <p><strong>Descripción:</strong> {service.service_description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  onClick={() => gatewayService.removeService(service.id_service).then(fetchServices)}
                >
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EndpointsResearch;
