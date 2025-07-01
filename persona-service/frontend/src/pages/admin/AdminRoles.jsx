/**
 * AdminRoles.jsx
 * Página de administración de roles.
 * Permite a los administradores crear, editar, eliminar roles y asignar roles a usuarios.
 * Utiliza servicios y hooks personalizados para la gestión de roles, usuarios y permisos.
 */

import React, { useState } from "react";

// UI Components
import { Fade } from "react-awesome-reveal";
import { Button } from "@/components/ui/button";
import RolesBreadcrumb from "@/components/roles/RolesBreadcrumb";
import RolesDeleteDialog from "@/components/roles/RolesDeleteDialog";
import RolesErrorDialog from "@/components/roles/RolesErrorDialog";
import RoleAssignment from "@/components/roles/RoleAssignment";
import RoleForm from "@/components/roles/RoleForm";
import RoleList from "@/components/roles/RoleList";

// Services
import { roleService } from "@/services/roleService";
import { permisoService } from "@/services/permisoService";
import { userService } from "@/services/userService";

// Hooks
import { useRoles } from "@/hooks/roles/useRoles";

/**
 * Componente principal de administración de roles.
 * - Gestiona el estado de roles, usuarios y permisos.
 * - Permite agregar, editar y eliminar roles.
 * - Asigna roles a usuarios.
 * - Muestra formularios y diálogos de confirmación/error.
 */
export default function AdminRoles() {
  /* ------------------------------- Estados ------------------------------ */
  const [showNewRoleForm, setShowNewRoleForm] = useState(false); // Visibilidad del formulario de rol
  const [newRoleName, setNewRoleName] = useState(""); // Nombre del nuevo rol o en edición
  const [selectedPermissions, setSelectedPermissions] = useState([]); // Permisos seleccionados
  const [editRoleId, setEditRoleId] = useState(null); // ID del rol en edición
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" }); // Diálogo de error
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Diálogo de confirmación de borrado
  const [roleToDelete, setRoleToDelete] = useState(null); // Rol a eliminar

  // Hook personalizado para manejar roles, usuarios y permisos
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

  /* --------------------------- Funciones Utilitarias --------------------------- */

  /**
   * Muestra un mensaje de error en el diálogo.
   * @param {string} message - Mensaje de error a mostrar.
   */
  function showError(message) {
    setErrorDialog({ open: true, message });
  }

  /**
   * Resetea el formulario de rol.
   */
  function resetForm() {
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(false);
    setEditRoleId(null);
  }

  /**
   * Formatea el nombre de un permiso para mostrarlo de forma amigable.
   * @param {string} permission - Nombre del permiso.
   * @returns {string} Nombre formateado.
   */
  function formatPermissionName(permission) {
    if (typeof permission !== "string") return "";
    const lastPart = permission.substring(permission.lastIndexOf(".") + 1);
    const replaced = lastPart.replace(/_/g, " ");
    return replaced
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /* ------------------------------ Handlers ----------------------------- */

  /**
   * Alterna la selección de un permiso.
   * @param {Object} permission - Permiso a alternar.
   */
  function handlePermissionToggle(permission) {
    setSelectedPermissions((prev) => {
      const exists = prev.some((p) => p.name === permission.name);
      return exists
        ? prev.filter((p) => p.name !== permission.name)
        : [...prev, permission];
    });
  }

  /**
   * Alterna la selección de un rol para asignación.
   * @param {number} roleId - ID del rol.
   */
  function handleRoleToggle(roleId) {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  }

  /**
   * Abre el formulario para crear un nuevo rol.
   */
  function openNewRoleForm() {
    setEditRoleId(null);
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(true);
  }

  /**
   * Crea un nuevo rol y asigna permisos.
   */
  async function handleAddRole() {
    if (!newRoleName.trim())
      return showError("El nombre del rol no puede estar vacío");

    const exists = roles.some(
      (role) => role.name.toLowerCase() === newRoleName.trim().toLowerCase()
    );
    if (exists) return showError("Ya existe un rol con ese nombre");

    const newRoleBody = {
      nombre_rol: newRoleName.trim(),
      descripcion: "",
    };

    try {
      // 1) Crear el rol
      const response = await roleService.crear(newRoleBody);
      const newRoleId = response.id_rol;

      // 2) Asignar permisos
      const permisosNombres = selectedPermissions.map((p) => p.name);
      await permisoService.asignarPermisos(newRoleId, permisosNombres);

      // 3) Actualizar estado local
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
  }

  /**
   * Prepara la edición de un rol existente.
   * @param {Object} role - Rol a editar.
   */
  function handleEditClick(role) {
    setEditRoleId(role.id);
    setNewRoleName(role.name);
    // Mapear strings de permisos a objetos completos
    const permisosCompletos = availablePermissions.filter((permiso) =>
      role.permissions.includes(permiso.name)
    );
    setSelectedPermissions(permisosCompletos);
    setShowNewRoleForm(true);
  }

  /**
   * Guarda los cambios al editar un rol.
   */
  async function handleSaveChanges() {
    if (!newRoleName.trim())
      return showError("El nombre del rol no puede estar vacío");

    const exists = roles.some(
      (role) =>
        role.id !== editRoleId &&
        role.name.toLowerCase() === newRoleName.trim().toLowerCase()
    );
    if (exists) return showError("Ya existe otro rol con ese nombre");

    try {
      // 1) Actualizar el nombre del rol
      await roleService.editar(editRoleId, {
        nombre_rol: newRoleName.trim(),
        descripcion: "",
      });

      // 2) Actualizar permisos
      const permisosNombres = selectedPermissions.map((p) => p.name || p);
      await permisoService.asignarPermisos(editRoleId, permisosNombres);

      // 3) Actualizar estado local
      const updatedRoles = roles.map((role) =>
        role.id === editRoleId
          ? { ...role, name: newRoleName.trim(), permissions: permisosNombres }
          : role
      );
      setRoles(updatedRoles);
      resetForm();
    } catch (error) {
      showError("Error al actualizar el rol o los permisos.");
      console.error(error);
    }
  }

  /**
   * Abre el diálogo de confirmación para eliminar un rol.
   * @param {Object} role - Rol a eliminar.
   */
  function openDeleteConfirmDialog(role) {
    setRoleToDelete(role);
    setOpenDeleteDialog(true);
  }

  /**
   * Confirma y elimina el rol seleccionado.
   */
  async function confirmDeleteRole() {
    if (!roleToDelete) return;
    try {
      await roleService.borrar(roleToDelete.id);
      setRoles(roles.filter((role) => role.id !== roleToDelete.id));
      if (editRoleId === roleToDelete.id) resetForm();
      setRoleToDelete(null);
      setOpenDeleteDialog(false);
    } catch (error) {
      showError("Error de conexión al intentar borrar el rol");
      console.error(error);
    }
  }

  /**
   * Asigna roles seleccionados a un usuario.
   */
  async function handleAsignar() {
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
  }

  /* ------------------------------- Render UI ------------------------------- */
  return (
    <div className="p-6 space-y-6 py-15 px-3 md:py-10 md:px-15">
      <Fade duration={300} triggerOnce>
        {/* Lista de roles */}
        <RoleList
          roles={roles}
          onEdit={handleEditClick}
          onDelete={openDeleteConfirmDialog}
          formatPermissionName={formatPermissionName}
        />

        {/* Botón para agregar nuevo rol */}
        {!showNewRoleForm && (
          <div>
            <Button onClick={openNewRoleForm} className="mb-4">
              Agregar Rol
            </Button>
          </div>
        )}

        {/* Formulario de rol (nuevo o edición) */}
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

        {/* Asignación de roles a usuarios */}
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
        />

        {/* Diálogo genérico de error */}
        <RolesErrorDialog
          errorDialog={errorDialog}
          setErrorDialog={setErrorDialog}
        />

        {/* Breadcrumb de navegación */}
        <RolesBreadcrumb />
      </Fade>
    </div>
  );
}
