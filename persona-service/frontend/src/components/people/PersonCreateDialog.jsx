import React from "react";
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

/**
 * PersonCreateDialog
 *
 * Componente de diálogo para crear una nueva persona en el sistema.
 * Permite ingresar datos personales, domicilio y contacto, incluyendo la asociación opcional a un usuario del sistema.
 * Utiliza varios componentes personalizados para formularios y selectores.
 *
 * Este componente reemplaza a PersonCreateDialog.jsx.
 *
 * Props:
 * @param {boolean} isDialogOpen - Indica si el diálogo está abierto.
 * @param {function} setIsDialogOpen - Función para cambiar el estado de apertura del diálogo.
 * @param {object} newUser - Objeto que contiene los datos del nuevo usuario/persona.
 * @param {function} handleChange - Función para manejar cambios en los campos del formulario.
 * @param {function} handleSubmit - Función que se ejecuta al enviar el formulario.
 * @param {Array<string>} tiposDocumentos - Lista de tipos de documentos disponibles.
 * @param {Array<string>} localidades - Lista de localidades disponibles.
 * @param {function} handleChangePostal - Función para manejar cambios en el campo de código postal.
 * @param {Array<string>} redesSociales - Lista de redes sociales disponibles.
 *
 * @returns {JSX.Element} El diálogo de creación de persona.
 */
function PersonCreateDialog({
    isDialogOpen,
    setIsDialogOpen,
    newUser,
    handleChange,
    handleSubmit,
    tiposDocumentos,
    localidades,
    handleChangePostal,
    redesSociales,
    usuarios = [],
    loading = false,
    error = null,
}) {

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={"mt-5"}>
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

                            {/* Select de usuario */}
                            {/*  
                            <div>

                                <label className="block text-sm font-medium mb-1" htmlFor="usuario_id">
                                    Usuario del sistema
                                </label>
                                <select
                                    id="usuario_id"
                                    name="usuario_id"
                                    className="border rounded px-2 py-1 w-full"
                                    value={newUser.usuario_id || ""}
                                    onChange={handleChange}
                                >
                                    <option value="">Ningún usuario</option>
                                    {loading && (
                                        <option disabled>Cargando usuarios...</option>
                                    )}
                                    {error && (
                                        <option disabled>{error}</option>
                                    )}
                                    {usuarios.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.nombre_usuario} ({u.email_usuario})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            */}
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

export default PersonCreateDialog;