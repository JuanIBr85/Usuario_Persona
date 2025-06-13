import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Users } from "lucide-react";

import UserFilter from "@/components/users/UserFilter";
import Loading from '@/components/loading/Loading';

import { PersonaService } from "@/services/personaService";

import UserTable from "@/components/users/UserTable";
import UserEditDialog from "@/components/users/UserEditDialog";
import UserBreadcrumb from "@/components/users/UserBreadcrumb";

/**
 * Componente AdminUsers
 * ---------------------
 * Este componente muestra una lista de usuarios registrados, 
 * con funcionalidades para filtrarlos, editar sus datos, 
 * ver detalles y eliminarlos.
 * 
 * Estado:
 * - editingUser: usuario que se está editando (null si no hay ninguno).
 * - users: lista completa de usuarios obtenida desde el servicio.
 * - mostrarFiltroAvanzado: controla si se muestra o no el filtro avanzado.
 * - filtro: texto para filtrar usuarios por nombre o email.
 * 
 * Efectos:
 * - Al montar, carga la lista completa de usuarios desde PersonaService.
 * 
 * Funcionalidades principales:
 * - Filtrado dinámico de usuarios según texto ingresado.
 * - Eliminación de usuarios con actualización inmediata de la lista.
 * - Navegación a pantalla de detalles de un usuario.
 * - Edición rápida de usuario mediante diálogo modal.
 * 
 * Componentes hijos usados:
 * - UserFilter: formulario para filtrar usuarios.
 * - UserTable: tabla que muestra la lista filtrada con botones de acción.
 * - UserEditDialog: diálogo modal para editar datos de usuario.
 * - UserBreadcrumb: barra de navegación breadcrumb.
 */
function AdminUsers() {
  const navigate = useNavigate();

  // Estado para usuario en edición
  const [editingUser, setEditingUser] = useState(null);
  // Lista completa de usuarios
  const [users, setUsers] = useState([]);
  // Control de filtro avanzado
  const [mostrarFiltroAvanzado, setMostrarFiltroAvanzado] = useState(false);
  // Texto del filtro
  const [filtro, setFiltro] = useState("");

  // Carga inicial de usuarios al montar el componente
  useEffect(() => {
    PersonaService.get_all()
      .then(res => {
        if (res && res.data) {
          // Mapea la respuesta para adaptar estructura de usuarios
          const mappedUsers = res.data.map(persona => ({
            id: persona.id_persona,
            nombre: persona.nombre_persona,
            apellido: persona.apellido_persona,
            email: persona.email || "sin@email.com",
          }));

          setUsers(mappedUsers);
        }
      })
      .catch(err => {
        console.error("Error obteniendo usuarios:", err);
      });
  }, []);

  // Filtra usuarios según texto en nombre, apellido o email (insensible a mayúsculas)
  const usuariosFiltrados = users.filter(user => {
    const textoMatch =
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(filtro.toLowerCase()) ||
      user.email.toLowerCase().includes(filtro.toLowerCase());
    return textoMatch;
  });

  /**
   * Elimina un usuario por id.
   * Actualiza la lista local tras eliminar exitosamente.
   * @param {number} id - ID del usuario a eliminar
   */
  const handleDelete = (id) => {
    PersonaService.borrar(id)
      .then(() => {
        setUsers(users.filter(user => user.id !== id));
      })
      .catch(err => {
        console.error("Error eliminando usuario:", err);
      });
  };

  /**
   * Navega a la pantalla de detalles del usuario.
   * @param {number} id - ID del usuario
   */
  const handleSeeDetails = (id) => {
    navigate(`/userdetails/${id}`);
  };

  /**
   * Maneja el envío del formulario de edición.
   * Actualiza el usuario en la lista local y hace petición para actualizar en backend.
   * @param {Event} e - Evento submit del formulario
   */
  const handleEditSubmit = (e) => {
    e.preventDefault();

    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));

    const body = {
      nombre_persona: editingUser.nombre || '',
      apellido_persona: editingUser.apellido || '',
    };

    PersonaService.editar(editingUser.id, body)
      .catch(err => {
        console.error("Error actualizando usuario:", err);
      });

    setEditingUser(null);
  };

  // Muestra loader si aún no hay usuarios cargados
  if (!users) return <Loading />;

  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Usuarios Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filtro de usuario */}
            <div className="overflow-auto border p-3 rounded-md shadow-sm mb-4">
              <UserFilter
                mostrarFiltroAvanzado={mostrarFiltroAvanzado}
                setMostrarFiltroAvanzado={setMostrarFiltroAvanzado}
                filtro={filtro}
                setFiltro={setFiltro}
              />
            </div>

            {/* Tabla con usuarios filtrados */}
            <div className="overflow-auto border p-3 rounded-md shadow-sm">
              <UserTable
                users={usuariosFiltrados}
                onEdit={setEditingUser}
                onSeeDetails={handleSeeDetails}
                onDelete={handleDelete}
              />
            </div>
          </CardContent>
        </Card>

        {/* Breadcrumb navegación */}
        <UserBreadcrumb />
      </Fade>

      {/* Diálogo modal para editar usuario */}
      <UserEditDialog
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

export default AdminUsers;
