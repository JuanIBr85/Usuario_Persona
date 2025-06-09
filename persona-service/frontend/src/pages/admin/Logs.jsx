import React from "react"
import { Fade } from "react-awesome-reveal"
import {
  BarChart,
  CartesianGrid,
  XAxis,
  Bar,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"

import {
  Home,
  ChartArea
} from "lucide-react";

import { Link } from "react-router-dom";

const data = [
  { month: "Enero", profesores: 34, alumnos: 80, admins: 5 },
  { month: "Febrero", profesores: 40, alumnos: 100, admins: 4 },
  { month: "Marzo", profesores: 30, alumnos: 90, admins: 6 },
  { month: "Abril", profesores: 25, alumnos: 70, admins: 3 },
  { month: "Mayo", profesores: 35, alumnos: 85, admins: 7 },
  { month: "Junio", profesores: 32, alumnos: 88, admins: 5 },
]

const config = {
  profesores: { label: "Profesores", color: "#60a5fa" },
  alumnos: { label: "Alumnos", color: "#fbbf24" },
  admins: { label: "Admins", color: "#f87171" },
}

const totalPorRol = data.reduce(
  (totals, entry) => {
    totals.profesores += entry.profesores
    totals.alumnos += entry.alumnos
    totals.admins += entry.admins
    return totals
  },
  { profesores: 0, alumnos: 0, admins: 0 }
)

export default function Logs() {
  return (
    <div className="p-6 space-y-6 py-30 px-3 md:pl-70 md:pr-70 md:pt-10">
      <Fade duration={300} triggerOnce>
        <h2 className="text-2xl font-bold">Estadísticas Mensuales</h2>
        <p className="text-muted-foreground mb-4">
          Visualización de registros mensuales de usuarios por tipo de rol.
        </p>

        <Card>
          <CardContent>
            <ChartContainer config={config} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={val => val.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="profesores" fill="var(--color-profesores)" radius={4} />
                <Bar dataKey="alumnos" fill="var(--color-alumnos)" radius={4} />
                <Bar dataKey="admins" fill="var(--color-admins)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-around text-center mt-4">
          <div>
            <p className="text-blue-500 font-semibold text-lg">{totalPorRol.profesores}</p>
            <p className="text-muted-foreground text-sm">Total Profesores</p>
          </div>
          <div>
            <p className="text-yellow-500 font-semibold text-lg">{totalPorRol.alumnos}</p>
            <p className="text-muted-foreground text-sm">Total Alumnos</p>
          </div>
          <div>
            <p className="text-red-500 font-semibold text-lg">{totalPorRol.admins}</p>
            <p className="text-muted-foreground text-sm">Total Admins</p>
          </div>
        </div>

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
              <BreadcrumbPage className="flex items-center gap-1"> <ChartArea className="w-4 h-4" /> Logs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>
    </div>
  )
}
