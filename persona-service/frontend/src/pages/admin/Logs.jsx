import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  Bar,
} from "recharts";

// shadcn/ui components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
  Home,
  ChartArea,
  Users,
  UserCheck,
  UserX,
  Link2,
  Link2Off,
  UserPlus,
  CalendarRange,
  CalendarCheck2,
  CalendarCheck,
  CalendarDays,
  BarChartBig,
} from "lucide-react";

// Services
import { PersonaService } from "@/services/personaService";

/**
 * Configuración de los datos del gráfico.
 * Define la etiqueta y el color para la barra de personas totales.
 */
const config = {
  personasTotales: { label: "Personas Totales", color: "#34d399" },
};

/**
 * Nombres de los meses en español.
 */
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Genera un array con los 12 meses del año actual, inicializando totales en 0.
 */
function getFullYearData(personasPorMes = []) {
  const year = new Date().getFullYear();
  // Mapear los datos recibidos por mes y año
  const dataMap = {};
  personasPorMes.forEach(({ month, year, total }) => {
    dataMap[`${year}-${month}`] = total;
  });
  // Construir los 12 meses
  return monthNames.map((name, idx) => {
    const key = `${year}-${idx + 1}`;
    return {
      month: `${name} ${year}`,
      personasTotales: dataMap[key] || 0,
    };
  });
}

export default function Logs() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPersonas, setTotalPersonas] = useState(null);

  useEffect(() => {
    PersonaService.get_count()
      .then(json => {
        // Compatibilidad con backend: json.data.total o json.data
        const stats = json?.data?.total || json?.data;
        setStats(stats || {});
        if (
          json.status === "success" &&
          stats &&
          Array.isArray(stats.personas_por_mes)
        ) {
          // Generar los 12 meses del año actual
          const mappedData = getFullYearData(stats.personas_por_mes);
          setData(mappedData);

          // Guardar el total general si está disponible en la respuesta
          if (typeof stats.total_personas === "number") {
            setTotalPersonas(stats.total_personas);
          } else {
            setTotalPersonas(mappedData.reduce((acc, d) => acc + d.personasTotales, 0));
          }
          setError(null);
        } else {
          setError("Error en datos recibidos");
        }
      })
      .catch(() => setError("Error al conectar con el servidor"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 md:pl-32 md:pr-32 md:pt-10">
      <Fade duration={300} triggerOnce>
        {/* Título y descripción */}
        <div className="flex items-center gap-2">
          <BarChartBig className="w-8 h-8 text-green-500" />
          <h2 className="text-3xl font-bold tracking-tight mb-1">Estadísticas Mensuales</h2>
        </div>
        <p className="text-muted-foreground">Visualización de personas registradas por mes.</p>

        {/* Tarjeta principal */}
        <Card className="shadow-xl border rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartArea className="w-6 h-6 text-green-500" />
              Personas registradas por mes
              {loading && <Skeleton className="ml-2 h-4 w-12 rounded-full" />}
            </CardTitle>
            <CardDescription>
              <CalendarRange className="inline-block w-4 h-4 mr-1 text-muted-foreground" />
              Detalle mensual del año actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-full rounded-md" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-2">
                <AlertTitle>
                  <UserX className="inline-block w-5 h-5 mr-1" />
                  Error
                </AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div>
                {/* Chart */}
                <div className="h-[260px] w-full flex items-center justify-center">
                  <BarChart
                    data={data}
                    width={700}
                    height={260}
                  >
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
                    {/* Simplified tooltips */}
                    {/* Custom Tooltips/Legend can be added with shadcn popover for advanced UX */}
                    <Bar
                      dataKey="personasTotales"
                      fill={config.personasTotales.color}
                      radius={5}
                      maxBarSize={36}
                    />
                  </BarChart>
                </div>

                {/* Total acumulado de personas */}
                <div className="mt-6 text-center space-y-2">
                  <Badge variant="outline" className="text-lg px-4 py-2 bg-green-100 border-green-400 text-green-700 flex items-center gap-2 justify-center">
                    <Users className="w-5 h-5" />
                    Total de personas registradas:{" "}
                    <span className="font-bold">
                      {typeof totalPersonas === "number"
                        ? totalPersonas
                        : data.reduce((acc, d) => acc + d.personasTotales, 0)}
                    </span>
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="resumen" className="mt-4">
          <TabsList className="w-full flex">
            <TabsTrigger value="resumen" className="flex-1 flex items-center gap-1 justify-center">
              <BarChartBig className="w-4 h-4" /> Resumen
            </TabsTrigger>
            <TabsTrigger value="por-dia" className="flex-1 flex items-center gap-1 justify-center">
              <CalendarDays className="w-4 h-4" /> Por día (últimos 30)
            </TabsTrigger>
            <TabsTrigger value="por-mes" className="flex-1 flex items-center gap-1 justify-center">
              <CalendarCheck2 className="w-4 h-4" /> Por mes (acumulado)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="resumen">
            <Card className="mt-2">
              <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total personas</p>
                    <p className="text-lg font-semibold">{stats.total_personas ?? "Sin datos"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Activas</p>
                    <p className="text-lg font-semibold">{stats.total_activas ?? "Sin datos"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">Inactivas</p>
                    <p className="text-lg font-semibold">{stats.total_inactivas ?? "Sin datos"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vinculadas Con Usuario</p>
                    <p className="text-lg font-semibold">{stats.total_vinculadas ?? "Sin datos"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link2Off className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">No vinculadas Con Usuario</p>
                    <p className="text-lg font-semibold">{stats.total_no_vinculadas ?? "Sin datos"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-green-700" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creadas hoy</p>
                    <p className="text-lg font-semibold">{stats.personas_creadas_hoy ?? "Sin datos"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-blue-700" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creadas este mes</p>
                    <p className="text-lg font-semibold">{stats.personas_creadas_este_mes ?? "Sin datos"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-green-700" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creadas este año</p>
                    <p className="text-lg font-semibold">{stats.personas_creadas_este_anio ?? "Sin datos"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="por-dia">
            <Card className="mt-2">
              <CardHeader>
                <CardTitle className={"flex items-center "}>
                  <CalendarDays className="w-5 h-5 mr-2" /> 
                  Personas por día
                </CardTitle>
                <CardDescription>Últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 pr-2">
                  <ul className="list-inside list-disc">
                    {Array.isArray(stats.personas_por_dia_ultimos_30) && stats.personas_por_dia_ultimos_30.length > 0 ? (
                      stats.personas_por_dia_ultimos_30.map((item, i) => (
                        <li key={i} className="py-1 flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          <span className="font-mono text-xs">{item.fecha}</span>: <span className="font-semibold">{item.total}</span>
                        </li>
                      ))
                    ) : (
                      <li>No hay datos</li>
                    )}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="por-mes">
            <Card className="mt-2">
              <CardHeader>
                <CardTitle className={"flex items-center "}>
                  <CalendarCheck2 className="w-5 h-5 mr-2" /> Personas por mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc">
                  {Array.isArray(stats.personas_por_mes) && stats.personas_por_mes.length > 0 ? (
                    stats.personas_por_mes.map((item, i) => (
                      <li key={i} className="py-1 flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        <span className="font-mono text-xs">{item.year}-{item.month}</span>: <span className="font-semibold">{item.total}</span>
                      </li>
                    ))
                  ) : (
                    <li>No hay datos</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Breadcrumb de navegación */}
        <Separator className="my-8" />
        <Breadcrumb>
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
                <ChartArea className="w-4 h-4" /> Registros
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>
    </div>
  );
}