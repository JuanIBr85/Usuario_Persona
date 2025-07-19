import { Fade } from "react-awesome-reveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useMemo } from "react";

export default function RoleForm({
  isEditing,
  newRoleName,
  setNewRoleName,
  availablePermissions,
  selectedPermissions,
  onTogglePermission,
  onSubmit,
  onCancel,
}) {
  const formRef = useRef(null);

  const groupedPermissions = useMemo(() => {
    const result = {};
    
    availablePermissions.forEach((permission) => {
      if (!permission.name) return;
      
      const module = permission.name.split(".")[0];
      
      if (!result[module]) result[module] = [];
      result[module].push(permission);
    });
    
    return result;
  }, [availablePermissions]);

  function formatPermissionName(permission) {
    if (!permission) return "";
    const lastPart = permission.substring(permission.lastIndexOf(".") + 1);
    const replaced = lastPart.replace(/_/g, " ");
    return replaced
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  useEffect(() => {
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
        <CardContent className="space-y-6">
          <Input
            placeholder="Nombre del rol"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          
         
          <div className="space-y-5">
            {Object.entries(groupedPermissions).map(([module, permissions]) => (
              <div key={module} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg capitalize mb-3">{module}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {permissions.map((permission) => (
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
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
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