import React, { useState } from "react";
import { Fade } from "react-awesome-reveal";
import { Button } from "@/components/ui/button";
import { BadgePlus, X } from "lucide-react";
import RolesBreadcrumb from "@/components/roles/RolesBreadcrumb";
import RolesDeleteDialog from "@/components/roles/RolesDeleteDialog";
import RolesErrorDialog from "@/components/roles/RolesErrorDialog";
import RoleForm from "@/components/roles/RoleForm";
import RoleList from "@/components/roles/RoleList";
import RoleAssignmentWithSearch from "@/components/roles/RoleAssignmentWithSearch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Services
import { roleService } from "@/services/roleService";
import { permisoService } from "@/services/permisoService";
import { userService } from "@/services/userService";

// Hooks
import { useRoles } from "@/hooks/roles/useRoles";

export default function AdminRoles() {
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editRoleId, setEditRoleId] = useState(null);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Estado para los alerts de shadcn
  const [alert, setAlert] = useState({
    open: false,
    title: "",
    description: "",
    variant: "default", // "default" | "destructive"
  });

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

  function showError(message) {
    setErrorDialog({ open: true, message });
  }

  function showShadcnAlert(title, description, variant = "default", timeout = 4000) {
    setAlert({ open: true, title, description, variant });
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, open: false }));
    }, timeout);
  }

  function resetForm() {
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(false);
    setEditRoleId(null);
  }

  function formatPermissionName(permission) {
    if (typeof permission !== "string") return "";
    const lastPart = permission.substring(permission.lastIndexOf(".") + 1);
    const replaced = lastPart.replace(/_/g, " ");
    return replaced
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function handlePermissionToggle(permission) {
    setSelectedPermissions((prev) => {
      const exists = prev.some((p) => p.name === permission.name);
      return exists
        ? prev.filter((p) => p.name !== permission.name)
        : [...prev, permission];
    });
  }

  function groupPermissionsByModule(permisos) {
    const resultado = {};
    console.log("Formateando permisos:", permisos);
    if (!Array.isArray(permisos)) return resultado;

    permisos.forEach((permiso) => {
      if (typeof permiso !== "string") return;
      // Extraer el módulo antes del primer punto
      const modulo = permiso.split(".")[0];

      // Formatear la última parte como en tu función original
      const ultimaParte = permiso.substring(permiso.lastIndexOf(".") + 1);
      const formateado = ultimaParte
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      if (!resultado[modulo]) resultado[modulo] = [];
      resultado[modulo].push(formateado);
      console.log(`Agregando permiso: ${formateado} al módulo: ${modulo}`);
    });
    return resultado;
  }


  function handleRoleToggle(roleId) {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  }

  function openNewRoleForm() {
    setEditRoleId(null);
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(true);
  }

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
      const response = await roleService.crear(newRoleBody);
      const newRoleId = response.id_rol;
      const permisosNombres = selectedPermissions.map((p) => p.name);
      await permisoService.asignarPermisos(newRoleId, permisosNombres);

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

  function handleEditClick(role) {
    setEditRoleId(role.id);
    setNewRoleName(role.name);
    const permisosCompletos = availablePermissions.filter((permiso) =>
      role.permissions.includes(permiso.name)
    );
    setSelectedPermissions(permisosCompletos);
    setShowNewRoleForm(true);
  }

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
      await roleService.editar(editRoleId, {
        nombre_rol: newRoleName.trim(),
        descripcion: "",
      });

      const permisosNombres = selectedPermissions.map((p) => p.name || p);
      await permisoService.asignarPermisos(editRoleId, permisosNombres);

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

  function openDeleteConfirmDialog(role) {
    setRoleToDelete(role);
    setOpenDeleteDialog(true);
  }

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

  async function handleAsignar() {
    if (!selectedUserId || selectedRoleIds.length === 0) {
      showShadcnAlert(
        "Advertencia",
        "Seleccioná un usuario y al menos un rol.",
        "destructive"
      );
      return;
    }
    try {
      await userService.updateUser(selectedUserId, {
        roles: selectedRoleIds,
      });
      showShadcnAlert("Éxito", "Roles asignados correctamente.", "default");
    } catch (error) {
      showShadcnAlert("Error", "Error al asignar los roles.", "destructive");
      console.log(error);
    }
  }

  return (
    <div className="p-6 space-y-6 py-15 px-3 md:py-10 md:px-15">
      {/* ALERT FLOATING TOAST */}
      {alert.open && (
        <div className="fixed bottom-16 right-4 z-50 w-96">
          <Alert
            variant={alert.variant || "default"}
            className="animate-in slide-in-from-right-8 duration-300 bg-white border-black relative"
          >
            <AlertTitle>{alert.title}</AlertTitle>
            {alert.description && (
              <AlertDescription>{alert.description}</AlertDescription>
            )}
            <button
              onClick={() => setAlert((prev) => ({ ...prev, open: false }))}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Cerrar"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        </div>
      )}

      <Fade duration={300} triggerOnce>
        <RoleList
          roles={roles}
          onEdit={handleEditClick}
          onDelete={openDeleteConfirmDialog}
          formatPermissionName={formatPermissionName}
          groupPermissionsByModule = {groupPermissionsByModule}
        >
          {!showNewRoleForm && (
            <div>
              <Button onClick={openNewRoleForm} className="mb-4">
                <BadgePlus /> Agregar Rol
              </Button>
            </div>
          )}
        </RoleList>

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

        <RoleAssignmentWithSearch
          usuarios={usuarios}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          roles={roles}
          selectedRoleIds={selectedRoleIds}
          onToggleRole={handleRoleToggle}
          onAsignar={handleAsignar}
        />

        <RolesDeleteDialog
          openDeleteDialog={openDeleteDialog}
          setOpenDeleteDialog={setOpenDeleteDialog}
          roleToDelete={roleToDelete}
          confirmDeleteRole={confirmDeleteRole}
        />

        <RolesErrorDialog
          errorDialog={errorDialog}
          setErrorDialog={setErrorDialog}
        />

        <RolesBreadcrumb />
      </Fade>
    </div>
  );
}