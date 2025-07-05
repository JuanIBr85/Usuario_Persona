import React from "react";
import { Eye } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ResearchStatusTable({ status }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye />
          Estado de investigación:
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status?.data?.log ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Endpoints encontrados</TableHead>
                <TableHead>En progreso</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(status.data.log).map(([serviceName, info]) => (
                <TableRow key={serviceName}>
                  <TableCell>{serviceName}</TableCell>
                  <TableCell>{info.endpoints_count}</TableCell>
                  <TableCell>{info.in_progress ? "Sí" : "No"}</TableCell>
                  <TableCell>{new Date(info.start_time * 1000).toLocaleString()}</TableCell>
                  <TableCell>{info.success ? "Éxito" : "Falló"}</TableCell>
                  <TableCell className="text-red-600">{info.error || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No hay datos de investigación disponibles.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default ResearchStatusTable;