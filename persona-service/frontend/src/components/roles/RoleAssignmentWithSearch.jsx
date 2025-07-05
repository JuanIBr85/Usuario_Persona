import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck } from "lucide-react";
import UserSelectWithSearch from "./UserSelectWithSearch";

export default function RoleAssignmentWithSearch({
  usuarios,
  selectedUserId,
  setSelectedUserId,
  roles,
  selectedRoleIds,
  onToggleRole,
  onAsignar,
  loadingUsuarios = false,
  errorUsuarios = null,
}) {
  return (
    <Card className="">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle>Asignar roles a un usuario</CardTitle>
        </div>
        <CardDescription>
          Selecciona un usuario y los roles que le quieres asignar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Usuario del sistema</span>
          </div>
          <UserSelectWithSearch
            usuarios={usuarios}
            value={selectedUserId}
            onChange={setSelectedUserId}
            loading={loadingUsuarios}
            error={errorUsuarios}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Roles a asignar</label>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Button
                key={role.id}
                type="button"
                variant={selectedRoleIds.includes(role.id) ? "default" : "outline"}
                onClick={() => onToggleRole(role.id)}
                size="sm"
              >
                {role.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onAsignar} className="">
          <ShieldCheck className="inline-block mr-2 h-4 w-4" />
          Asignar Roles
        </Button>
      </CardFooter>
    </Card>
  );
}