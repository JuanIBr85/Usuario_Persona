import React from 'react'
import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


const chartData = [
  { month: "Enero", profesores: 34, alumnos: 80, admins: 5 },
  { month: "Febrero", profesores: 40, alumnos: 100, admins: 4 },
  { month: "Marzo", profesores: 30, alumnos: 90, admins: 6 },
  { month: "Abril", profesores: 25, alumnos: 70, admins: 3 },
  { month: "Mayo", profesores: 35, alumnos: 85, admins: 7 },
  { month: "Junio", profesores: 32, alumnos: 88, admins: 5 },
]
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Fade } from "react-awesome-reveal";

const chartConfig = {
  profesores: {
    label: "Profesores",
    color: "#60a5fa",
  },
  alumnos: {
    label: "Alumnos",
    color: "#fbbf24",
  },
  admins: {
    label: "Admins",
    color: "#f87171",
  },
}

function Logs() {
  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
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

        <Breadcrumb className="mt-auto self-start">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/adminpanel">Panel De Administrador</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Logs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>
    </div>
  )
}

export default Logs
