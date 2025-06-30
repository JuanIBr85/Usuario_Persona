import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoleAssignment({
  usuarios,
  selectedUserId,
  setSelectedUserId,
  roles,
  selectedRoleIds,
  onToggleRole,
  onAsignar,
}) {
  return (
  <Card>
  <CardHeader className="flex items-center gap-2">
    <ShieldCheck className="w-5 h-5 text-muted-foreground" />
    <CardTitle>Asignar Rol a Usuario</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="space-y-4">
      {/* Select personalizado */}
      <select
        onChange={(e) => setSelectedUserId(e.target.value)}
        value={selectedUserId}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">Seleccionar usuario</option>
        {usuarios?.map((u) => (
          <option key={u.id_usuario} value={u.id}>
            {u.nombre_usuario} ({u.email_usuario})
          </option>
        ))}
      </select>

      {/* Roles en flex */}
      <div className="flex flex-col gap-2">
        {roles.map((role) => (
          <label
            key={role.id}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <input
              type="checkbox"
              checked={selectedRoleIds.includes(role.id)}
              onChange={() => onToggleRole(role.id)}
              className="accent-primary"
            />
            <span className="capitalize">{role.name}</span>
          </label>
        ))}
      </div>

      {/* Botón  */}
      <div className="flex justify-left pt-2">
        <Button onClick={onAsignar} className="w-40">Asignar Rol</Button>
      </div>
    </div>
  </CardContent>
</Card>

  );
}
