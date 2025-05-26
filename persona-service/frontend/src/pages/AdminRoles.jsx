import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Pencil } from "lucide-react";
import { Fade } from "react-awesome-reveal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

  const handleAddRole = () => {
    if (!newRoleName) return;
    const newRole = {
      id: Date.now(),
      name: newRoleName,
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
    if (!newRoleName) return;
    const updatedRoles = roles.map((role) =>
      role.id === editRoleId
        ? { ...role, name: newRoleName, permissions: selectedPermissions }
        : role
    );
    setRoles(updatedRoles);
    resetForm();
  };

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleDeleteRole = (id) => {
    setRoles(roles.filter((role) => role.id !== id));
    if (editRoleId === id) resetForm();
  };

  const resetForm = () => {
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(false);
    setEditRoleId(null);
  };

  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardHeader>
            <CardTitle>Roles y Permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Lista de roles */}
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center gap-4 border p-3 rounded-md shadow-sm"
                >
                  <span className="flex-1">
                    {role.name}
                    <div className="text-xs text-gray-500">
                      {role.permissions?.length > 0
                        ? role.permissions.join(", ")
                        : "Sin permisos asignados"}
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
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {/* Botón para agregar nuevo rol */}
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

              {/* Formulario nuevo rol o edición */}
              {showNewRoleForm && (
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
              )}
            </div>
          </CardContent>
        </Card>

        <Breadcrumb className="mt-auto self-start">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/adminpanel">Panel De Administrador</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Roles y Permisos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Fade>
    </div>
  );
}