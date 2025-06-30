import React, { useState, useEffect } from "react";

// COMPONENTE: AdminRoles
// Este componente permite a los administradores crear, editar y eliminar roles,
// así como asignarles permisos.  Se apoya en `roleService` y `permisoService`
/* -------------------------------------------------------------------------- */

import RolesBreadcrumb from "@/components/roles/RolesBreadcrumb";
import RolesDeleteDialog from "@/components/roles/RolesDeleteDialog";
import RolesErrorDialog from "@/components/roles/RolesErrorDialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Utilidades de UI (botones, inputs, íconos, animaciones)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Pencil, ShieldCheck, Users } from "lucide-react";

import { Fade } from "react-awesome-reveal";

// Import de services
import { roleService } from "@/services/roleService";
import { userService } from "@/services/userService"
import { permisoService } from "@/services/permisoService";

export default function AdminRoles() {
  /* ------------------------------- Estados ------------------------------ */
  const [roles, setRoles] = useState([]); // Lista de roles existentes
  const [showNewRoleForm, setShowNewRoleForm] = useState(false); // Mostrar / ocultar formulario
  const [newRoleName, setNewRoleName] = useState(""); // Nombre del nuevo rol o del rol en edición
  const [selectedPermissions, setSelectedPermissions] = useState([]); // Permisos seleccionados
  const [editRoleId, setEditRoleId] = useState(null); // Id del rol en modo edición
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" }); // Diálogo de error
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Diálogo de confirmación de borrado
  const [roleToDelete, setRoleToDelete] = useState(null); // Rol que se va a eliminar
  const [availablePermissions, setAvailablePermissions] = useState([]); // Permisos disponibles
  const [selectedUserId, setSelectedUserId] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  /* --------------------------- Utilidades UI --------------------------- */
  const showError = (message) => {
    // Muestra un diálogo de error con un mensaje específico
    setErrorDialog({ open: true, message });
  };

  const resetForm = () => {
    // Resetea el formulario
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(false);
    setEditRoleId(null);
  };

  /* ------------------------------ Handlers ----------------------------- */
  // Alterna un permiso en la lista de seleccionados (lo agrega o elimina)
  const handlePermissionToggle = (permission) => {
    setSelectedPermissions((prev) => {
      const exists = prev.some((p) => p.name === permission.name);
      return exists
        ? prev.filter((p) => p.name !== permission.name)
        : [...prev, permission];
    });
  };

  // Crea un nuevo rol
  const handleAddRole = async () => {
    if (!newRoleName.trim())
      return showError("El nombre del rol no puede estar vacío");

    // Evita duplicados
    const exists = roles.some(
      (role) => role.name.toLowerCase() === newRoleName.trim().toLowerCase()
    );
    if (exists) return showError("Ya existe un rol con ese nombre");

    const newRoleBody = {
      nombre_rol: newRoleName.trim(),
      descripcion: "",
    };

    try {
      // Debido a que primero se crean los roles y luego recién se asignan sus permisos los pasos son los sgtes.:

      // 1) Crear el rol (sin permisos todavía)
      const response = await roleService.crear(newRoleBody);

      // 2) Extraer el id del rol recién creado
      const newRoleId = response.id_rol;

      // 3. transformamos selectedPermissions a array solo con nombres para que el json cumpla las condiciones del backend
      const permisosNombres = selectedPermissions.map((p) => p.name);

      // 4. se asigna permisos usando el servicio
      await permisoService.asignarPermisos(newRoleId, permisosNombres);

      // 5. actualizamos el estado con el nuevo rol (sin permisos, o con los permisos asignados)
      const newRole = {
        id: newRoleId,
        name: response.nombre_rol || newRoleName.trim(),
        permissions: permisosNombres,
      };

      setRoles([...roles, newRole]);
      resetForm();
    } catch (error) {
      showError("Error al crear el rol y asignar permisos.");
      console.error(error);
    }
  };

  // Prepara la edición de un rol
  const handleEditClick = (role) => {
    setEditRoleId(role.id); // ID del rol
    setNewRoleName(role.name); // Nombre

    // Mapear strings de permisos a objetos completos desde availablePermissions
    const permisosCompletos = availablePermissions.filter((permiso) =>
      role.permissions.includes(permiso.name)
    );

    setSelectedPermissions(permisosCompletos); // Asignar permisos como objetos
    setShowNewRoleForm(true);
  };

  const handleSaveChanges = async () => {
    if (!newRoleName.trim())
      return showError("El nombre del rol no puede estar vacío");

    // Verifica que no haya duplicado el nombre
    const exists = roles.some(
      (role) =>
        role.id !== editRoleId &&
        role.name.toLowerCase() === newRoleName.trim().toLowerCase()
    );
    if (exists) return showError("Ya existe otro rol con ese nombre");

    try {
      console.log("Editando:", editRoleId);
      // 1) Actualizar el nombre del rol
      const data = await roleService.editar(editRoleId, {
        nombre_rol: newRoleName.trim(),
        descripcion: "",
      });
      console.log("data", data);
      // 2) Enviar permisos actualizados
      const permisosNombres = selectedPermissions.map((p) => p.name || p);
      await permisoService.asignarPermisos(editRoleId, permisosNombres);

      // 3) Actualiza el estado local
      const updatedRoles = roles.map((role) =>
        role.id === editRoleId
          ? { ...role, name: newRoleName.trim(), permissions: permisosNombres }
          : role
      );

      setRoles(updatedRoles);
      console.log(updatedRoles);
      resetForm();
    } catch (error) {
      showError("Error al actualizar el rol o los permisos.");
      console.error(error);
    }
  };

  const openDeleteConfirmDialog = (role) => {
    // Abre el diálogo de confirmación para eliminar un rol específico
    setRoleToDelete(role); // Guarda el rol que se desea eliminar
    setOpenDeleteDialog(true); // Muestra el diálogo de confirmación
  };

  const confirmDeleteRole = async () => {
    // Confirma y elimina el rol previamente seleccionado
    if (!roleToDelete) return;

    try {
      const response = await roleService.borrar(roleToDelete.id);
      console.log(response);
      setRoles(roles.filter((role) => role.id !== roleToDelete.id));
      if (editRoleId === roleToDelete.id) resetForm();
      setRoleToDelete(null);
      setOpenDeleteDialog(false);
    } catch (error) {
      showError("Error de conexión al intentar borrar el rol");
      console.error(error);
    }
  };

  function formatPermissionName(permission) {
    if (typeof permission !== "string") return "";

    // 1. Buscamos la última posición del punto (.) en el string
    //    Ejemplo: "Auth.admin.crear_Usuario" => la última posición del punto es antes de "crear_Usuario"
    const lastPart = permission.substring(permission.lastIndexOf(".") + 1);

    // 2. Reemplazamos los guiones bajos (_) por espacios
    //    "crear_Usuario" => "crear Usuario"
    const replaced = lastPart.replace(/_/g, " ");

    // 3. Capitalizamos cada palabra para que quede más amigable
    //    "crear Usuario" => "Crear Usuario"
    return replaced
      .split(" ") // Separa en palabras
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Primera letra mayúscula
      .join(" "); // Une todo en una frase
  }

  const handleAsignar = async () => {
    if (!selectedUserId || !selectedRoleId) {
      alert("Seleccioná un usuario y un rol.");
      return;
    }

    try {
      await userService.updateUser(selectedUserId, {
        roles: [selectedRoleId],
      });
      alert("Rol asignado correctamente.");
    } catch (error) {
      alert("Error al asignar el rol.");
      console.log(error);
    }
  };


  /* ------------------------------ Efectos ------------------------------ */
  useEffect(() => {
    // Trae todos los roles
    const fetchRoles = async () => {
      try {
        const data = await roleService.get_all();
        console.log(data);
        const transformedRoles = data.roles.map((role) => ({
          id: role.id_rol,
          name: role.nombre_rol,
          permissions: role.permisos,
        }));

        setRoles(transformedRoles);
      } catch (error) {
        showError("Error al cargar los roles desde el servidor.");
        console.error(error);
      }
    };

    const fetchUsuarios = async () => {
      try {
        const userData = await userService.getAllUsers()
        console.log(userData);
        setUsuarios(Array.isArray(userData) ? userData : []);
      } catch (error) {
        console.log(error)
      }
    };

    // Trae todos los permisos
    const fetchPermisos = async () => {
      try {
        const data = await permisoService.get_all();

        const transformedPermisos = data.permisos.map((permiso) => ({
          id: permiso.id_permiso,
          name: permiso.nombre_permiso,
        }));

        setAvailablePermissions(transformedPermisos);
      } catch (error) {
        showError("Error al cargar los permisos desde el servidor.");
        console.error(error);
      }
    };

    fetchPermisos();
    fetchRoles();
    fetchUsuarios();
  }, []);

  const [isTimeout, setIsTimeout] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let intervalId;
    if (roles.length > 0) {
      // Si hay roles, cancelamos el timeout
      setIsTimeout(false);
    } else {
      // Si no hay roles y el countdown > 0, arrancamos el intervalo
      if (countdown > 0) {
        intervalId = setInterval(() => {
          setCountdown((prevCount) => prevCount - 1);
        }, 1000);
      } else {
        // Cuando countdown llega a 0, seteamos timeout en false
        setIsTimeout(false);
      }
    }
    console.log("countdown: ", countdown);

    // Limpia el intervalo
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [roles, countdown]);

  /* ------------------------------- UI ---------------------------------- */
  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      {/* Animación Fade para suavizar la aparición */}
      <Fade duration={300} triggerOnce>
        {/* Tarjeta principal */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <CardTitle>Roles y Permisos</CardTitle>
          </CardHeader>

          <CardContent>
            {isTimeout && (
              <div class="text-center">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-800"
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
                  <span class="sr-only">Cargando...</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {/* Listado de roles */}
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center gap-4 border p-3 rounded-md shadow-sm"
                >
                  <span className="flex-1 flex items-start gap-2">
                    <Users className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      {role.name}
                      <div className="text-xs text-gray-500">
                        {role.permissions?.length > 0
                          ? role.permissions
                            .map(formatPermissionName)
                            .join(", ")
                          : "Sin permisos asignados"}
                      </div>
                    </div>
                  </span>

                  {/*Botón de editar*/}
                  <Button
                    variant="outline"
                    onClick={() => handleEditClick(role)}
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Button>

                  {/*Botón de borrar*/}
                  <Button
                    variant="outline"
                    onClick={() => openDeleteConfirmDialog(role)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Borrar
                  </Button>
                </div>
              ))}

              {/* Botón para crear un nuevo rol */}
              <Button
                variant="outline"
                className="w-fit mt-4"
                onClick={() => {
                  resetForm();
                  setShowNewRoleForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Agregar otro rol
              </Button>

              {/* Formulario de creación / edición */}
              {showNewRoleForm && (
                <Fade duration={300} triggerOnce>
                  <div className="mt-6 space-y-4 border p-4 rounded-md">
                    <Input
                      placeholder="Nombre del rol"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />

                    {/* Checkboxes de permisos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availablePermissions &&
                        availablePermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.some(
                                (p) => p.id === permission.id
                              )}
                              onChange={() =>
                                handlePermissionToggle(permission)
                              }
                            />
                            <span className="text-sm">
                              {formatPermissionName(permission.name)}
                            </span>
                          </label>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      {editRoleId ? (
                        <Button onClick={handleSaveChanges}>
                          Guardar Cambios
                        </Button>
                      ) : (
                        <Button onClick={handleAddRole}>Agregar Rol</Button>
                      )}
                      <Button variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </Fade>
              )}
            </div>

          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <CardTitle>Asignar Rol a Usuario</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-3">
              <select onChange={(e) => setSelectedUserId((e.target.value))} value={selectedUserId}>
                <option value="">Seleccionar usuario</option>
                {console.log(usuarios)}
                {usuarios?.map((u) => (
                  <option key={u.id_usuario} value={u.id}>
                    {u.nombre_usuario} ({u.email_usuario}) ({u.id})
                  </option>
                ))}
              </select>

              <select onChange={(e) => setSelectedRoleId(Number(e.target.value))} value={selectedRoleId}>
                <option value="">Seleccionar rol</option>
                {console.log(roles)}
                {
                  roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                    </option>
                  ))}
              </select>
              <Button className={"w-[10rem]"} onClick={handleAsignar}>Asignar Rol</Button>
            </div>
          </CardContent>
        </Card>

        {/* Diálogo de confirmación de borrado */}
        <RolesDeleteDialog
          openDeleteDialog={openDeleteDialog}
          setOpenDeleteDialog={setOpenDeleteDialog}
          roleToDelete={roleToDelete}
          confirmDeleteRole={confirmDeleteRole}
        ></RolesDeleteDialog>

        {/* Diálogo genérico de error */}
        <RolesErrorDialog
          errorDialog={errorDialog}
          setErrorDialog={setErrorDialog}
        ></RolesErrorDialog>

        {/* Breadcrumb de navegación */}
        <RolesBreadcrumb></RolesBreadcrumb>
      </Fade>
    </div>
  );
}
