import React, { useState } from "react";

// COMPONENTE: AdminRoles
// Este componente permite a los administradores crear, editar y eliminar roles,
// así como asignarles permisos.  Se apoya en `roleService` y `permisoService`
/* -------------------------------------------------------------------------- */

import RolesBreadcrumb from "@/components/roles/RolesBreadcrumb";
import RolesDeleteDialog from "@/components/roles/RolesDeleteDialog";
import RolesErrorDialog from "@/components/roles/RolesErrorDialog";
import RoleAssignment from "@/components/roles/RoleAssignment";
import RoleForm from "@/components/roles/RoleForm";
import RoleList from "@/components/roles/RoleList";



import { Fade } from "react-awesome-reveal";

import { roleService } from "@/services/roleService";
import { userService } from "@/services/userService"
import { permisoService } from "@/services/permisoService";

import { useRoles } from "@/hooks/roles/useRoles";
import { Button } from "@/components/ui/button";

export default function AdminRoles() {
  /* ------------------------------- Estados ------------------------------ */
  const [showNewRoleForm, setShowNewRoleForm] = useState(false); // Mostrar / ocultar formulario
  const [newRoleName, setNewRoleName] = useState(""); // Nombre del nuevo rol o del rol en edición
  const [selectedPermissions, setSelectedPermissions] = useState([]); // Permisos seleccionados
  const [editRoleId, setEditRoleId] = useState(null); // Id del rol en modo edición
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" }); // Diálogo de error
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Diálogo de confirmación de borrado
  const [roleToDelete, setRoleToDelete] = useState(null); // Rol que se va a eliminar

  const showError = (message) => {
    setErrorDialog({ open: true, message });
  };

  const {
    roles,
    setRoles,
    usuarios,
    setUsuarios,
    availablePermissions,
    selectedUserId,
    setSelectedUserId,
    selectedRoleIds,
    setSelectedRoleIds,
    isTimeout,
    countdown,
  } = useRoles(showError);


  /* --------------------------- Utilidades UI --------------------------- */

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

  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
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
    if (!selectedUserId || selectedRoleIds.length === 0) {
      alert("Seleccioná un usuario y al menos un rol.");
      return;
    }

    try {
      await userService.updateUser(selectedUserId, {
        roles: selectedRoleIds,
      });
      alert("Roles asignados correctamente.");
    } catch (error) {
      alert("Error al asignar los roles.");
      console.log(error);
    }
  };


  /* ----------------------- Función para abrir formulario ----------------------- */
const openNewRoleForm = () => {
  setEditRoleId(null);
  setNewRoleName("");
  setSelectedPermissions([]);
  setShowNewRoleForm(true);
};

  /* ------------------------------- UI ---------------------------------- */
  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-10 md:px-15">
      {/* Animación Fade para suavizar la aparición */}
      <Fade duration={300} triggerOnce>

        <RoleList
          roles={roles}
          onEdit={handleEditClick}
          onDelete={openDeleteConfirmDialog}
          formatPermissionName={formatPermissionName}
        />

        {!showNewRoleForm && (
          <div>
            <Button onClick={openNewRoleForm} className="mb-4">
              Agregar Rol
            </Button>
          </div>
        )}

        {showNewRoleForm && (
          <RoleForm
            isEditing={!!editRoleId}
            newRoleName={newRoleName}
            setNewRoleName={setNewRoleName}
            availablePermissions={availablePermissions}
            selectedPermissions={selectedPermissions}
            onTogglePermission={handlePermissionToggle}
            onSubmit={editRoleId ? handleSaveChanges : handleAddRole}
            onCancel={resetForm}
            formatPermissionName={formatPermissionName}
          />
        )}

        <RoleAssignment
          usuarios={usuarios}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          roles={roles}
          selectedRoleIds={selectedRoleIds}
          onToggleRole={handleRoleToggle}
          onAsignar={handleAsignar}
        />

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
