import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Plus,
  Pencil,
  ShieldCheck,
  Users,
  AlertTriangle,
  Settings2,
  Home,
  ShieldUser
} from "lucide-react";
import { Fade } from "react-awesome-reveal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

// Import de services
import { roleService } from "@/services/roleService";


export default function AdminRoles() {
  // Estado para almacenar la lista de roles
  const [roles, setRoles] = useState([]);

  // Estado para mostrar u ocultar el formulario de creación/edición de rol
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  // Estado para almacenar el nombre del nuevo rol o el nombre editado
  const [newRoleName, setNewRoleName] = useState("");
  // Estado para almacenar los permisos seleccionados
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  // Estado para identificar si se está editando un rol (por su id)
  const [editRoleId, setEditRoleId] = useState(null);
  // Estado para manejar el diálogo de error (abierto y mensaje)
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  // Estado para controlar la visibilidad del diálogo de confirmación de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // Estado que guarda el rol que se desea eliminar
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Muestra un diálogo de error con un mensaje específico
  const showError = (message) => {
    setErrorDialog({ open: true, message });
  };

  // Resetea el formulario de rol (nuevo o edición)
  const resetForm = () => {
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(false);
    setEditRoleId(null);
  };

  // Alterna un permiso en la lista de seleccionados (lo agrega o elimina)
  const handlePermissionToggle = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission) // lo elimina si ya está
        : [...prev, permission] // lo agrega si no está
    );
  };

  // Agrega un nuevo rol a la lista
  const handleAddRole = async () => {
  if (!newRoleName.trim()) return showError("El nombre del rol no puede estar vacío");

  // Verifica si ya existe un rol con el mismo nombre (ignorando mayúsculas)
  const exists = roles.some(
    (role) => role.name.toLowerCase() === newRoleName.trim().toLowerCase()
  );
  if (exists) return showError("Ya existe un rol con ese nombre");

  const newRoleBody = {
    nombre_rol: newRoleName.trim(),
    descripcion: "", // Si tienes estado para descripción, ponlo aquí
    permisos: [], // Debe ser un array, no string
  };

  try {
    const response = await roleService.crear(newRoleBody);

    const newRole = {
      id: response.id_rol,  
      name: response.nombre_rol || newRoleName.trim(),
      permissions: response.permisos || selectedPermissions,
    };

    setRoles([...roles, newRole]); // Agrega el nuevo rol al estado
    resetForm(); // Limpia el formulario
  } catch (error) {
    showError("Error al crear el rol.");
    console.error(error);
  }
};


  // Prepara el formulario para editar un rol existente
  const handleEditClick = (role) => {
    setEditRoleId(role.id); // Establece el ID del rol que se está editando
    setNewRoleName(role.name); // Llena el campo de nombre con el valor actual del rol
    setSelectedPermissions(role.permissions || []); // Llena los permisos actuales del rol
    setShowNewRoleForm(true); // Muestra el formulario de edición
  };

  // Guarda los cambios hechos a un rol existente
  const handleSaveChanges = () => {
    if (!newRoleName.trim()) return showError("El nombre del rol no puede estar vacío");

    // Verifica que no haya otro rol con el mismo nombre (excluyendo el actual)
    const exists = roles.some(
      (role) =>
        role.id !== editRoleId &&
        role.name.toLowerCase() === newRoleName.trim().toLowerCase()
    );
    if (exists) return showError("Ya existe otro rol con ese nombre");

    // Mapea los roles y actualiza solo el que coincide con el ID en edición
    const updatedRoles = roles.map((role) =>
      role.id === editRoleId
        ? { ...role, name: newRoleName.trim(), permissions: selectedPermissions }
        : role
    );
    setRoles(updatedRoles); // Actualiza el estado con la nueva lista
    resetForm(); // Limpia el formulario
  };

  // Abre el diálogo de confirmación para eliminar un rol específico
  const openDeleteConfirmDialog = (role) => {
    setRoleToDelete(role); // Guarda el rol que se desea eliminar
    setOpenDeleteDialog(true); // Muestra el diálogo de confirmación
  };

  // Confirma y elimina el rol previamente seleccionado
  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      const response = await roleService.borrar(roleToDelete.id);
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
    return permission
      .split('_') // separa por guiones bajos
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitaliza la primera letra de cada palabra
      .join(' '); // une con espacios
  }

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.get_all();

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

    fetchRoles();
  }, []);

  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 " />
            <CardTitle>Roles y Permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
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
                          ? role.permissions.map(formatPermissionName).join(", ")
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

              {showNewRoleForm && (
                <Fade duration={300} triggerOnce>
                  <div className="mt-6 space-y-4 border p-4 rounded-md">
                    <Input
                      placeholder="Nombre del rol"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                    <Input
                      placeholder="Descripción del rol"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {/* availablePermissions.map((permission) => (
                        <label key={permission} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                          />
                          <span className="text-sm">{permission}</span>
                        </label>
                      ))*/}
                    </div>
                    <div className="flex gap-2">
                      {editRoleId ? (
                        <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
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

        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-500 w-5 h-5" />
                <DialogTitle>¿Estás seguro?</DialogTitle>
              </div>
              <DialogDescription>
                Esta acción no se puede deshacer. Se eliminará el rol{" "}
                <strong>{roleToDelete?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteRole}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={errorDialog.open}
          onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        >
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="text-red-500 w-5 h-5" />
                <DialogTitle>Error</DialogTitle>
              </div>
              <DialogDescription>{errorDialog.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end">
              <Button
                onClick={() =>
                  setErrorDialog({ ...errorDialog, open: false })
                }
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <BreadcrumbPage className="flex items-center gap-1">
                <ShieldUser className="w-4 h-4" />
                Roles y Permisos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>
    </div>
  );
}