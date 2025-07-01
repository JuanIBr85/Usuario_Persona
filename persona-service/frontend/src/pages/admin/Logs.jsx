import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  Bar,
} from "recharts";

// UI Components
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

// Icons
import { Home, ChartArea } from "lucide-react";

// Services
import { PersonaService } from "@/services/personaService";

/**
 * Configuración de los datos del gráfico.
 * Define la etiqueta y el color para la barra de usuarios totales.
 */
const config = {
  usuariosTotales: { label: "Usuarios Totales", color: "#34d399" },
};

/**
 * Nombres de los meses en español.
 * Se utiliza para mostrar los meses en el eje X del gráfico.
 */
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * @file Logs.jsx
 * @module pages/admin/Logs
 * @description
 * Página de estadísticas mensuales de usuarios registrados.
 *
 * Este componente obtiene y visualiza, mediante un gráfico de barras,
 * la cantidad de usuarios registrados por mes.
 *
 * Características principales:
 * - Obtiene datos de usuarios registrados por mes desde el servicio PersonaService.
 * - Muestra un gráfico de barras con los datos mensuales.
 * - Indica el total acumulado de usuarios registrados.
 * - Incluye navegación breadcrumb para volver al panel de administrador.
 *
 * @returns {JSX.Element} Componente de estadísticas mensuales de usuarios registrados.
 */
export default function Logs() {
  // Estado para los datos del gráfico
  const [data, setData] = useState([]);
  // Estado de carga
  const [loading, setLoading] = useState(true);
  // Estado de error
  const [error, setError] = useState(null);

  /**
   * Efecto para obtener los datos de usuarios registrados por mes.
   * Llama a PersonaService.get_count() y procesa la respuesta.
   */
  useEffect(() => {
    PersonaService.get_count()
      .then(json => {
        if (json.status === "success" && Array.isArray(json.data.total)) {
          // Mapea la data para el gráfico
          const mappedData = json.data.total.map(({ month, year, total }) => ({
            month: `${monthNames[month - 1]} ${year}`, // Ejemplo: "Junio 2025"
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
    <div className="p-6 space-y-6 py-15 px-6 md:pl-70 md:pr-70 md:pt-10">
      <Fade duration={300} triggerOnce>
        {/* Título y descripción */}
        <h2 className="text-2xl font-bold">Estadísticas Mensuales</h2>
        <p className="text-muted-foreground mb-4">
          Visualización de usuarios registrados por mes.
        </p>

        {/* Tarjeta con el gráfico o mensajes de carga/error */}
        <Card>
          <CardContent>
            {loading ? (
              <p>Cargando datos...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <ChartContainer config={config} className="min-h-[200px] w-full">
                <BarChart data={data} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={val =>
                      val.length > 10 ? val.slice(0, 10) + "…" : val
                    }
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

        {/* Total acumulado de usuarios */}
        {!loading && !error && (
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold">
              Total de usuarios registrados:{" "}
              {data.reduce((acc, d) => acc + d.usuariosTotales, 0)}
            </p>
          </div>
        )}

        {/* Breadcrumb de navegación */}
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
