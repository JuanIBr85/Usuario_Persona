import { Fade } from "react-awesome-reveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoleForm({
  isEditing,
  newRoleName,
  setNewRoleName,
  availablePermissions,
  selectedPermissions,
  onTogglePermission,
  onSubmit,
  onCancel,
  formatPermissionName,
}) {
  return (
    <Fade duration={300} triggerOnce>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar este rol" : "Agrega un nuevo rol"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nombre del rol"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availablePermissions.map((permission) => (
              <label key={permission.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPermissions.some((p) => p.id === permission.id)}
                  onChange={() => onTogglePermission(permission)}
                />
                <span className="text-sm">
                  {formatPermissionName(permission.name)}
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={onSubmit}>
              {isEditing ? "Guardar Cambios" : "Agregar Rol"}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </Fade>
  );
}
