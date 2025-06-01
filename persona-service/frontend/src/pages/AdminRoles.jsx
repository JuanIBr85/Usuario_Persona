import React, { useState } from "react";
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

const initialRoles = [
  { id: 1, name: "Administrador", permissions: ["Puede hacer X"] },
  { id: 2, name: "Alumno", permissions: ["Puede hacer Y"] },
  { id: 3, name: "Nombre Rol 3", permissions: [] },
];

const availablePermissions = [
  "Puede hacer X",
  "Puede hacer Y",
  "Puede hacer A",
  "Puede hacer B",
];

export default function AdminRoles() {
  const [roles, setRoles] = useState(initialRoles);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editRoleId, setEditRoleId] = useState(null);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const showError = (message) => {
    setErrorDialog({ open: true, message });
  };

  const resetForm = () => {
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(false);
    setEditRoleId(null);
  };

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return showError("El nombre del rol no puede estar vacío");

    const exists = roles.some(
      (role) => role.name.toLowerCase() === newRoleName.trim().toLowerCase()
    );
    if (exists) return showError("Ya existe un rol con ese nombre");

    const newRole = {
      id: Date.now(),
      name: newRoleName.trim(),
      permissions: selectedPermissions,
    };

    setRoles([...roles, newRole]);
    resetForm();
  };

  const handleEditClick = (role) => {
    setEditRoleId(role.id);
    setNewRoleName(role.name);
    setSelectedPermissions(role.permissions || []);
    setShowNewRoleForm(true);
  };

  const handleSaveChanges = () => {
    if (!newRoleName.trim()) return showError("El nombre del rol no puede estar vacío");

    const exists = roles.some(
      (role) =>
        role.id !== editRoleId &&
        role.name.toLowerCase() === newRoleName.trim().toLowerCase()
    );
    if (exists) return showError("Ya existe otro rol con ese nombre");

    const updatedRoles = roles.map((role) =>
      role.id === editRoleId
        ? { ...role, name: newRoleName.trim(), permissions: selectedPermissions }
        : role
    );
    setRoles(updatedRoles);
    resetForm();
  };

  const openDeleteConfirmDialog = (role) => {
    setRoleToDelete(role);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      setRoles(roles.filter((role) => role.id !== roleToDelete.id));
      if (editRoleId === roleToDelete.id) resetForm();
      setRoleToDelete(null);
      setOpenDeleteDialog(false);
    }
  };

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
                          ? role.permissions.join(", ")
                          : "Sin permisos asignados"}
                      </div>
                    </div>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(role)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteConfirmDialog(role)}
                  >
                    <Trash2 className="w-4 h-4" />
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availablePermissions.map((permission) => (
                        <label key={permission} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                          />
                          <span className="text-sm">{permission}</span>
                        </label>
                      ))}
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
