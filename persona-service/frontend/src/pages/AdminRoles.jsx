import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Pencil, Check, X, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const PermissionBadge = ({ permission, selected, onToggle }) => (
  <Badge
    variant={selected ? "default" : "outline"}
    className={cn(
      "cursor-pointer transition-colors",
      selected && "bg-primary/90 hover:bg-primary/80"
    )}
    onClick={onToggle}
  >
    {selected && <Check className="w-3 h-3 mr-1" />}
    {permission}
  </Badge>
);

export default function AdminRoles() {
  const [roles, setRoles] = useState(initialRoles);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editRoleId, setEditRoleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    searchTerm === ""
  );

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    const newRole = {
      id: Date.now(),
      name: newRoleName.trim(),
      permissions: [...selectedPermissions],
    };
    setRoles([...roles, newRole]);
    resetForm();
  };

  const handleEditClick = (role) => {
    setEditRoleId(role.id);
    setNewRoleName(role.name);
    setSelectedPermissions([...role.permissions]);
    setShowNewRoleForm(true);
  };

  const handleSaveChanges = () => {
    if (!newRoleName.trim()) return;
    const updatedRoles = roles.map((role) =>
      role.id === editRoleId
        ? { ...role, name: newRoleName.trim(), permissions: [...selectedPermissions] }
        : role
    );
    setRoles(updatedRoles);
    resetForm();
  };

  const handleDeleteRole = (id, name) => {
    if (window.confirm(`¿Estás seguro que deseas eliminar el rol "${name}"?`)) {
      setRoles(roles.filter((role) => role.id !== id));
      if (editRoleId === id) resetForm();
    }
  };

  const togglePermission = (permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const resetForm = () => {
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(false);
    setEditRoleId(null);
  };

  return (
    <AdminLayout 
      title="Gestión de Roles"
      description="Crea y gestiona los roles y permisos del sistema"
    >
      <AdminBreadcrumb items={[
        { label: "Roles y Permisos" }
      ]} />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Roles del Sistema</CardTitle>
              <CardDescription>
                {roles.length} {roles.length === 1 ? 'rol' : 'roles'} en total
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                resetForm();
                setShowNewRoleForm(true);
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rol
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative max-w-md">
            <Input
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {showNewRoleForm && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {editRoleId ? 'Editar Rol' : 'Nuevo Rol'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del Rol</label>
                  <Input
                    placeholder="Ej: Administrador"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Permisos</label>
                  <div className="flex flex-wrap gap-2">
                    {availablePermissions.map((permission) => (
                      <PermissionBadge
                        key={permission}
                        permission={permission}
                        selected={selectedPermissions.includes(permission)}
                        onToggle={() => togglePermission(permission)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={editRoleId ? handleSaveChanges : handleAddRole}
                    disabled={!newRoleName.trim()}
                  >
                    {editRoleId ? 'Guardar Cambios' : 'Crear Rol'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {filteredRoles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron roles que coincidan con la búsqueda
              </div>
            ) : (
              <div className="divide-y">
                {filteredRoles.map((role) => (
                  <div 
                    key={role.id} 
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {role.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {role.permissions.map(perm => (
                              <Badge key={perm} variant="secondary" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin permisos asignados</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditClick(role)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteRole(role.id, role.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}