import { Trash2, Pencil, Users, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoleList({ roles, onEdit, onDelete, formatPermissionName, children }) {
    return (
        <div className="flex flex-col gap-5">
            <Card>
                <CardHeader className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Lista de roles creados</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {roles.map((role) => (
                        <Card key={role.id} className="shadow-sm">
                            <CardHeader className="flex flex-col justify-between pb-2 md:flex-row md:items-center">
                                <div className="flex items-start gap-2">
                                    <Users className="w-5 h-5 mt-1 text-muted-foreground shrink-0" />
                                    <div>
                                        <CardTitle className="text-base">{role.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {role.permissions?.length > 0
                                                ? role.permissions.map(formatPermissionName).join(", ")
                                                : "Sin permisos asignados"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-5 md:mt-0">
                                    <Button variant="outline" onClick={() => onEdit(role)}>
                                        <Pencil className="w-4 h-4" />
                                        Editar
                                    </Button>
                                    <Button variant="outline" onClick={() => onDelete(role)}>
                                        <Trash2 className="w-4 h-4" />
                                        Borrar
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}