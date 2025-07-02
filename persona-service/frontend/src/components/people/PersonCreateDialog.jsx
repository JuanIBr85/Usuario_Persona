import {
    Dialog, DialogClose, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function PersonCreateDialog({
    newUser, setNewUser, tiposDocumentos, localidades, redesSociales,
    handleSubmit, handleChange
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="mt-5">
                    <Plus /> Crear Persona
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Nueva Persona</DialogTitle>
                    <DialogDescription>Completá los campos y guarda la persona.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4">
                    {/* Datos personales */}
                    <div className="grid gap-3">
                        <Label>Nombre</Label>
                        <Input
                            name="nombre"
                            value={newUser.nombre || ""}
                            onChange={handleChange}
                        />
                        <Label>Apellido</Label>
                        <Input
                            name="apellido"
                            value={newUser.apellido || ""}
                            onChange={handleChange}
                        />
                        <Label>Fecha de nacimiento</Label>
                        <Input
                            type="date"
                            name="fecha_nacimiento"
                            value={newUser.fecha_nacimiento || ""}
                            onChange={handleChange}
                        />
                        <Label>Tipo de documento</Label>
                        <select
                            className="border rounded px-2 py-1"
                            name="tipo_documento"
                            value={newUser.tipo_documento || ""}
                            onChange={handleChange}
                        >
                            {tiposDocumentos.map((doc, i) => (
                                <option key={i} value={doc}>
                                    {doc}
                                </option>
                            ))}
                        </select>
                        <Label>Nro. documento</Label>
                        <Input
                            name="nro_documento"
                            value={newUser.nro_documento || ""}
                            onChange={handleChange}
                        />
                        {/* 
                          <Label>ID Usuario</Label>
                          <Input
                            name="usuario_id"
                            value={newUser.usuario_id || ""}
                            onChange={handleChange}
                          />
                           */}
                    </div>

                    {/* Domicilio */}
                    <hr />
                    <div className="grid gap-3">
                        <Label>Calle</Label>
                        <Input
                            name="domicilio_calle"
                            value={newUser.domicilio_calle || ""}
                            onChange={handleChange}
                        />
                        <Label>Número</Label>
                        <Input
                            name="domicilio_numero"
                            value={newUser.domicilio_numero || ""}
                            onChange={handleChange}
                        />
                        <Label>Piso</Label>
                        <Input
                            name="domicilio_piso"
                            value={newUser.domicilio_piso || ""}
                            onChange={handleChange}
                        />
                        <Label>Dpto</Label>
                        <Input
                            name="domicilio_dpto"
                            value={newUser.domicilio_dpto || ""}
                            onChange={handleChange}
                        />
                        <Label>Referencia</Label>
                        <Input
                            name="domicilio_referencia"
                            value={newUser.domicilio_referencia || ""}
                            onChange={handleChange}
                        />
                        <Label>Código Postal</Label>
                        <Input
                            name="codigo_postal"
                            value={newUser.codigo_postal || ""}
                            onChange={handleChange}
                        />
                        <Label>Localidad</Label>
                        <select
                            name="localidad"
                            value={newUser.localidad || ""}
                            onChange={handleChange}
                            className="border rounded px-2 py-1"
                        >
                            <option value="">Selecciona una localidad</option>
                            {localidades.map((loc, index) => (
                                <option key={`${loc}-${index}`} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Contacto */}
                    <hr />
                    <div className="grid gap-3">
                        <Label>Teléfono fijo</Label>
                        <Input
                            name="telefono_fijo"
                            value={newUser.telefono_fijo || ""}
                            onChange={handleChange}
                        />
                        <Label>Teléfono móvil</Label>
                        <Input
                            name="telefono_movil"
                            value={newUser.telefono_movil || ""}
                            onChange={handleChange}
                        />
                        <Label>Red social</Label>
                        <select
                            name="red_social_nombre"
                            value={newUser.red_social_nombre || ""}
                            onChange={handleChange}
                            className="border rounded px-2 py-1"
                        >
                            <option value="">Selecciona una red social</option>
                            {redesSociales.map((rs) => (
                                <option key={rs} value={rs}>
                                    {rs}
                                </option>
                            ))}
                        </select>
                        <Label>Su usuario de {newUser.red_social_nombre}</Label>
                        <Input
                            name="red_social_contacto"
                            value={newUser.red_social_contacto || ""}
                            onChange={handleChange}
                        />
                        <Label>Email contacto</Label>
                        <Input
                            name="email_contacto"
                            type={"email"}
                            value={newUser.email_contacto || ""}
                            onChange={handleChange}
                        />
                        <Label>Observación</Label>
                        <Input
                            name="observacion_contacto"
                            value={newUser.observacion_contacto || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button type="submit">Guardar</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
