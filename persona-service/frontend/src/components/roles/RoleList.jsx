import { Trash2, Pencil, Users, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function RoleList({ roles, onEdit, onDelete, formatPermissionName, groupPermissionsByModule, children }) {
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
                                            {Object.entries(groupPermissionsByModule(role.permissions)).map(([modulo, permisos]) => (
                                                <div key={modulo} className="mb-1 flex flex-wrap items-center gap-1">
                                                    <span className="font-semibold capitalize mr-1">{modulo}:</span>
                                                    {permisos.map((permiso, idx) => (
                                                        <span key={idx} className="bg-gray-100 text-gray-700 rounded px-1.5 py-0.5 text-xs mr-1 mb-1">
                                                            {permiso}
                                                        </span>
                                                    ))}
                                                </div>
                                            ))}
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