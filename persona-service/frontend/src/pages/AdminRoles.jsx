import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { Fade } from 'react-awesome-reveal'

const initialRoles = [
  { id: 1, name: "Administrador" },
  { id: 2, name: "Alumno" },
  { id: 3, name: "Nombre Rol 3" },
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

  const handleAddRole = () => {
    if (!newRoleName) return;
    const newRole = {
      id: Date.now(),
      name: newRoleName,
    };
    setRoles([...roles, newRole]);
    setNewRoleName("");
    setSelectedPermissions([]);
    setShowNewRoleForm(false);
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
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
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
                  <span className="flex-1">{role.name}</span>
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
                onClick={() => setShowNewRoleForm(!showNewRoleForm)}
              >
                <Plus className="w-4 h-4 mr-2" /> Agregar otro rol
              </Button>

              {/* Formulario nuevo rol */}
              {showNewRoleForm && (
                <div className="mt-6 space-y-4 border p-4 rounded-md">
                  <Input
                    placeholder="Nombre del nuevo rol"
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
                  <Button onClick={handleAddRole}>Agregar Rol</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Fade>
    </div>
  );
}