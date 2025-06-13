import React, { useEffect, useState } from "react";
import { Fade } from "react-awesome-reveal";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  Bar,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";

import {
  Home,
  ChartArea
} from "lucide-react";

import { Link } from "react-router-dom";

const config = {
  usuariosTotales: { label: "Usuarios Totales", color: "#34d399" },
};

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function Logs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/api/personas/count")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success" && Array.isArray(json.data.total)) {
          // Mapear la data para el gráfico
          const mappedData = json.data.total.map(({ month, year, total }) => ({
            month: `${monthNames[month - 1]} ${year}`, // ej: "Junio 2025"
            usuariosTotales: total,
          }));
          setData(mappedData);
          setError(null);
        } else {
          setError("Error en datos recibidos");
        }
      })
      .catch(() => setError("Error al conectar con el servidor"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 py-30 px-3 md:pl-70 md:pr-70 md:pt-10">
      <Fade duration={300} triggerOnce>
        <h2 className="text-2xl font-bold">Estadísticas Mensuales</h2>
        <p className="text-muted-foreground mb-4">
          Visualización de usuarios registrados por mes.
        </p>

        <Card>
          <CardContent>
            {loading ? (
              <p>Cargando datos...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <ChartContainer config={config} className="min-h-[200px] w-full">
                <BarChart
                  data={data}
                  accessibilityLayer
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={val => val.length > 10 ? val.slice(0, 10) + "…" : val} // corta labels largos
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="usuariosTotales"
                    fill={config.usuariosTotales.color}
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {!loading && !error && (
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold">
              Total de usuarios registrados: {data.reduce((acc, d) => acc + d.usuariosTotales, 0)}
            </p>
          </div>
        )}

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
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <ChartArea className="w-4 h-4" /> Logs
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>
    </div>
  );
}
