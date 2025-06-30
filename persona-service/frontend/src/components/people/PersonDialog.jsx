import React, {  } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import InputValidate from "@/components/inputValidate/InputValidate";
import SimpleSelect from "@/components/SimpleSelect";

import { SelectItem } from "@/components/ui/select";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";

function PersonDialog({
    isDialogOpen,
    setIsDialogOpen,
    newUser,
    handleChange,
    handleSubmit,
    tiposDocumentos,
    localidades,
    handleChangePostal,
    redesSociales,
}) {
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={"mt-5"}>
                    {" "}
                    <Plus /> Crear Persona
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Nueva Persona</DialogTitle>
                    <DialogDescription>
                        Completá los campos y guarda la persona.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos personales */}
                    <div className="space-y-4">
                        <h4 className="text-md font-medium">Datos Personales</h4>
                        <ResponsiveColumnForm>
                            <InputValidate
                                id="nombre"
                                name="nombre"
                                type="text"
                                labelText="Nombre"
                                value={newUser.nombre || ""}
                                required
                            />

                            <InputValidate
                                id="apellido"
                                name="apellido"
                                type="text"
                                labelText="Apellido"
                                value={newUser.apellido || ""}
                                required
                            />
                        </ResponsiveColumnForm>

                        <ResponsiveColumnForm>
                            <SimpleSelect
                                name="tipo_documento"
                                label="Tipo de documento"
                                value={newUser.tipo_documento || "DNI"}
                                placeholder="Selecciona un tipo de documento"
                                onValueChange={(value) => handleChange({ target: { name: 'tipo_documento', value } })}
                                required
                            >
                                {tiposDocumentos.map((doc, i) => (
                                    <SelectItem key={i} value={doc} >
                                        {doc}
                                    </SelectItem>
                                ))}
                            </SimpleSelect>

                            <InputValidate
                                id="nro_documento"
                                name="nro_documento"
                                type="text"
                                labelText="Nro. documento"
                                value={newUser.nro_documento || ""}
                                required
                            />
                        </ResponsiveColumnForm>

                        <ResponsiveColumnForm>
                            <InputValidate
                                id="fecha_nacimiento"
                                name="fecha_nacimiento"
                                type="date"
                                labelText="Fecha de nacimiento"
                                value={newUser.fecha_nacimiento || ""}
                                required
                            />

                            <InputValidate
                                id="usuario_id"
                                name="usuario_id"
                                type="text"
                                labelText="ID Usuario"
                                value={newUser.usuario_id || ""}
                            />
                        </ResponsiveColumnForm>
                    </div>

                    {/* Domicilio */}
                    <hr className="my-6" />
                    <div className="space-y-4">
                        <h4 className="text-md font-medium">Domicilio</h4>
                        <ResponsiveColumnForm>
                            <InputValidate
                                id="domicilio_calle"
                                name="domicilio_calle"
                                type="text"
                                labelText="Calle"
                                value={newUser.domicilio_calle || ""}
                            />

                            <InputValidate
                                id="domicilio_numero"
                                name="domicilio_numero"
                                type="text"
                                labelText="Número"
                                value={newUser.domicilio_numero || ""}
                            />
                        </ResponsiveColumnForm>

                        <ResponsiveColumnForm>
                            <InputValidate
                                id="domicilio_piso"
                                name="domicilio_piso"
                                type="text"
                                labelText="Piso"
                                value={newUser.domicilio_piso || ""}
                            />
                        </ResponsiveColumnForm>
                        <ResponsiveColumnForm>
                            <InputValidate
                                id="domicilio_dpto"
                                name="domicilio_dpto"
                                type="text"
                                labelText="Departamento"
                                value={newUser.domicilio_dpto || ""}
                            />

                            <InputValidate
                                id="codigo_postal"
                                name="codigo_postal"
                                type="text"
                                labelText="Código Postal"
                                value={newUser.codigo_postal || ""}
                                onChange={handleChangePostal}
                                required
                            />
                        </ResponsiveColumnForm>

                        <ResponsiveColumnForm>
                            <SimpleSelect
                                name="localidad"
                                label="Localidad"
                                value={newUser.localidad || ""}
                                placeholder="Selecciona una localidad"
                                onValueChange={(value) => handleChange({ target: { name: 'localidad', value } })}
                                required
                            >
                                {localidades.map((loc, index) => (
                                    <SelectItem key={`${loc}-${index}`} value={loc}>
                                        {loc}
                                    </SelectItem>
                                ))}
                            </SimpleSelect>
                            <div /> {/* Espacio vacío para mantener el diseño de dos columnas */}
                        </ResponsiveColumnForm>
                    </div>

                    {/* Contacto */}
                    <hr className="my-6" />
                    <div className="space-y-4">
                        <h4 className="text-md font-medium">Contacto</h4>
                        <ResponsiveColumnForm>
                            <InputValidate
                                id="telefono_fijo"
                                name="telefono_fijo"
                                type="tel"
                                labelText="Teléfono fijo"
                                value={newUser.telefono_fijo || ""}
                            />

                            <InputValidate
                                id="telefono_movil"
                                name="telefono_movil"
                                type="tel"
                                labelText="Teléfono móvil"
                                value={newUser.telefono_movil || ""}
                            />
                        </ResponsiveColumnForm>

                        <ResponsiveColumnForm>
                            <SimpleSelect
                                name="red_social_nombre"
                                label="Red social"
                                value={newUser.red_social_nombre || ""}
                                placeholder="Selecciona una red social"
                                onValueChange={(value) => handleChange({ target: { name: 'red_social_nombre', value } })}
                            >
                                {redesSociales.map((rs) => (
                                    <SelectItem key={rs} value={rs}>
                                        {rs}
                                    </SelectItem>
                                ))}
                            </SimpleSelect>

                            <InputValidate
                                id="red_social_contacto"
                                name="red_social_contacto"
                                type="text"
                                labelText={`Usuario de ${newUser.red_social_nombre || 'red social'}`}
                                value={newUser.red_social_contacto || ""}
                                disabled={!newUser.red_social_nombre}
                            />
                        </ResponsiveColumnForm>

                        <ResponsiveColumnForm>
                            <InputValidate
                                id="email_contacto"
                                name="email_contacto"
                                type="email"
                                labelText="Email de contacto"
                                value={newUser.email_contacto || ""}
                                required
                            />
                            <div /> {/* Espacio vacío para mantener el diseño de dos columnas */}
                        </ResponsiveColumnForm>

                        <div className="w-full">
                            <InputValidate
                                id="observacion_contacto"
                                name="observacion_contacto"
                                type="text"
                                labelText="Observaciones de contacto"
                                value={newUser.observacion_contacto || ""}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default PersonDialog;
