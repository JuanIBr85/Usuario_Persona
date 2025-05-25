import React from 'react'
import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartData = [
  { month: "Enero", registradores: 12, profesores: 34, alumnos: 80, admins: 5 },
  { month: "Febrero", registradores: 20, profesores: 40, alumnos: 100, admins: 4 },
  { month: "Marzo", registradores: 18, profesores: 30, alumnos: 90, admins: 6 },
  { month: "Abril", registradores: 15, profesores: 25, alumnos: 70, admins: 3 },
  { month: "Mayo", registradores: 22, profesores: 35, alumnos: 85, admins: 7 },
  { month: "Junio", registradores: 19, profesores: 32, alumnos: 88, admins: 5 },
]

const chartConfig = {
  registradores: {
    label: "Registradores",
    color: "#34d399",
  },
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
    <div className="p-5 md:px-60">
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

        <Bar dataKey="registradores" fill="var(--color-registradores)" radius={4} />
        <Bar dataKey="profesores" fill="var(--color-profesores)" radius={4} />
        <Bar dataKey="alumnos" fill="var(--color-alumnos)" radius={4} />
        <Bar dataKey="admins" fill="var(--color-admins)" radius={4} />
      </BarChart>
    </ChartContainer>
     </div>
  )
}

export default Logs
