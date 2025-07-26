import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import PersonaDeleteDialog from "./PersonDeleteDialog";
import { Fade } from "react-awesome-reveal";

// Función para formatear la fecha en formato DD-MM-YYYY
function formatearFecha(fechaStr) {
  if (!fechaStr) return "-";
  const [a, m, d] = fechaStr.split("-");
  return `${d}-${m}-${a}`;
}
/**
 * Tabla de personas
 
 * Este componente muestra la lista paginada de personas.
 * El ordenamiento se maneja en el componente padre, aca  se notifican los cambios de orden al hacer clic
 * en los encabezados.
 */

function PersonTable({
  persons,
  users,
  onEdit,
  onSeeDetails,
  onDelete,
  sortConfig,
  onSortChange,
}) {
  const [isTimeout, setIsTimeout] = useState(true);
  const [countdown, setCountdown] = useState(3);

  // Los datos ya vienen ordenados desde el componente padre
  //const sortedPersons = persons;

  // Función para manejar el click en un encabezado ordenable
  // Informa al componente padre que cambió la columna o dirección de orden
  const requestSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    if (onSortChange) {
      onSortChange({ key, direction });
    }
  };

  // Función para obtener el icono de ordenamiento según el estado
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }

    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  useEffect(() => {
    let intervalId;
    if (persons.length > 0) {
      // Si hay usuarios, cancelamos el timeout
      setIsTimeout(false);
    } else {
      // Si no hay usuarios y el countdown > 0, arrancamos el intervalo
      if (countdown > 0) {
        intervalId = setInterval(() => {
          setCountdown((prevCount) => prevCount - 1);
        }, 1000);
      } else {
        // Cuando countdown llega a 0, seteamos timeout en false
        setIsTimeout(false);
      }
    }

    // Limpia el intervalo
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [persons, countdown]);

  // Componente para renderizar encabezados ordenables
  const SortableHeader = ({ column, label }) => (
    <TableHead className="cursor-pointer" onClick={() => requestSort(column)}>
      <div className="flex items-center">
        {label}
        {getSortIcon(column)}
      </div>
    </TableHead>
  );

  return (
    <Table>
      <TableCaption>Lista de personas registradas.</TableCaption>
      <TableHeader>
        <TableRow>
          <SortableHeader column="nombre" label="Nombre" />
          <SortableHeader column="tipo_documento" label="Tipo Doc." />
          <SortableHeader column="nro_documento" label="Nro. Documento" />
          <SortableHeader column="fecha_nacimiento" label="Fecha Nac." />
          <SortableHeader column="usuario" label="Usuario Vinculado" />
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {persons.length > 0 ? (
          persons.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium truncate max-w-40">
                {user.nombre} {user.apellido}
              </TableCell>
              <TableCell>{user.tipo_documento}</TableCell>
              <TableCell>{user.nro_documento}</TableCell>
              <TableCell>{formatearFecha(user.fecha_nacimiento)}</TableCell>
              <TableCell className="truncate max-w-40">
                {users.find((u) => u.id === user.usuario_id)
                  ? users.find((u) => u.id === user.usuario_id).email_usuario
                  : user.usuario_id>0 ? "Usuario eliminado" : "No vinculado"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onSeeDetails(user.id)}
                  >
                    <Eye className="mr-1" /> Ver Más
                  </Button>
                  <Button variant="outline" onClick={() => onEdit(user)}>
                    <Pencil className="mr-1" /> Edición Rapida
                  </Button>
                  <PersonaDeleteDialog user={user} onDelete={onDelete} />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center w-full">
              {isTimeout ? (
                <div className="text-center">
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-800"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Cargando...</span>
                  </div>
                </div>
              ) : (
                <span>
                  No se encontraron personas que coincidan con el filtro.
                </span>
              )}
            </TableCell>
          </TableRow>
        )}

      </TableBody>
    </Table>
  );
}

export default PersonTable;
