import { Fade } from "react-awesome-reveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

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
  const formRef = useRef(null);

  // Este efecto hace scroll después que el componente fue renderizado
  useEffect(() => {
    // Pequeño timeout para asegurar que el componente esté  renderizado antes del scroll
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Fade duration={300} triggerOnce>
      <div
        id="role-form"
        ref={formRef}
        style={{ scrollMarginTop: "80px" }}
      ></div>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Editar este rol" : "Agrega un nuevo rol"}
          </CardTitle>
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
                  checked={selectedPermissions.some(
                    (p) => p.id === permission.id
                  )}
                  onChange={() => onTogglePermission(permission)}
                />
                <span className="text-sm">
                  {formatPermissionName(permission.name)}
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-2 ">
            <Button onClick={onSubmit} className={"cursor-pointer"}>
              {isEditing ? "Guardar Cambios" : "Agregar Rol"}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className={"cursor-pointer"}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </Fade>
  );
}
