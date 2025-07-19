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

import { Input } from "@/components/ui/input";
import InputValidate from "@/components/inputValidate/InputValidate";
import SimpleSelect from "@/components/SimpleSelect";
import { SelectItem } from "@/components/ui/select";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";
import { useState, useMemo } from "react";

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
  const [userSearch, setUserSearch] = useState("");
  const [tipoDoc, setTipoDoc] = useState(Object.keys(tiposDocumentos)[0] || "");

  // Calcular fecha máxima para mayores de 17 años
  const seventeenYearsAgo = new Date();
  seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
  const maxDate = seventeenYearsAgo.toISOString().slice(0, 10);

  const filteredUsuarios = useMemo(() => {
    if (!userSearch) return usuarios;
    return usuarios.filter(
      (u) =>
        (u.nombre_usuario &&
          u.nombre_usuario.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.email_usuario &&
          u.email_usuario.toLowerCase().includes(userSearch.toLowerCase()))
    );
  }, [userSearch, usuarios]);

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
                type="text"
                labelText="Nombre(s)"
                value={newUser.nombre || ""}
                cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
                maxLength={50}
                required
                validatePattern="^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ'’ ]+$"
                validationMessage="El nombre solo puede contener letras."
              />

              <InputValidate
                id="apellido"
                cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
                type="text"
                labelText="Apellido(s)"
                value={newUser.apellido || ""}
                maxLength={50}
                required
                validatePattern="^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ'’ ]+$"
                validationMessage="El nombre solo puede contener letras."
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <SimpleSelect
                id="tipo_documento"
                label="Tipo de documento"
                value={newUser.tipo_documento || "DNI"}
                placeholder="Selecciona un tipo de documento"
                onValueChange={(value) => {
                  setTipoDoc(value);
                  handleChange({ target: { name: "tipo_documento", value } });
                }}
                required
              >
                {Object.keys(tiposDocumentos).map((doc, i) => (
                  <SelectItem key={i} value={doc}>
                    {doc}
                  </SelectItem>
                ))}
              </SimpleSelect>

              <InputValidate
                id="nro_documento"
                type="text"
                labelText="Nro. documento"
                maxLength={13}
                value={newUser.nro_documento || ""}
                validatePattern={tiposDocumentos[tipoDoc]}
                validationMessage="Número de documento inválido"
                required
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="fecha_nacimiento"
                type="date"
                labelText="Fecha de nacimiento"
                value={newUser.fecha_nacimiento || ""}
                required
                max={maxDate}
                min="1905-01-01"
              />

              {/* Select de usuario */}
              <SimpleSelect
                label="Usuario del sistema"
                id="usuario_id"
                value="-1"
                disabled={loading}
                placeholder="Buscar usuario por nombre o email"
              >
                <div className="px-2 py-1">
                  <Input
                    autoFocus
                    value={userSearch}
                    placeholder="Buscar por email o usuario..."
                    className="w-full"
                  />
                </div>
                <SelectItem value="-1">Ningún usuario</SelectItem>
                {loading && (
                  <SelectItem disabled>Cargando usuarios...</SelectItem>
                )}
                {error && <SelectItem disabled>{error}</SelectItem>}
                {filteredUsuarios.length === 0 && !loading && !error && (
                  <SelectItem disabled>No se encontraron usuarios</SelectItem>
                )}
                {filteredUsuarios.map((u) => (
                  <SelectItem key={u.id} value={`${u.id}`}>
                    {u.nombre_usuario} ({u.email_usuario})
                  </SelectItem>
                ))}
              </SimpleSelect>
            </ResponsiveColumnForm>
          </div>

          {/* Domicilio */}
          <hr className="my-6" />
          <div className="space-y-4">
            <h4 className="text-md font-medium">Domicilio</h4>
            <ResponsiveColumnForm>
              <InputValidate
                id="domicilio_calle"
                maxLength={50}
                type="text"
                labelText="Calle"
                value={newUser.domicilio_calle || ""}
                validatePattern="^(?!\s*$).+"
                validationMessage="El nombre de la calle no puede estar vacío ni tener solo espacios"
              />

              <InputValidate
                id="domicilio_numero"
                maxLength={10}
                type="text"
                labelText="Número"
                value={newUser.domicilio_numero || ""}
                validatePattern="^\d{1,5}$"
                validationMessage="Solo se permiten números (máximo 5 dígitos)"
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="domicilio_piso"
                maxLength={3}
                type="text"
                labelText="Piso"
                value={newUser.domicilio_piso || ""}
              />
            </ResponsiveColumnForm>
            <ResponsiveColumnForm>
              <InputValidate
                id="domicilio_dpto"
                maxLength={2}
                type="text"
                labelText="Departamento"
                value={newUser.domicilio_dpto || ""}
              />

              <InputValidate
                id="codigo_postal"
                type="text"
                placeholder="Ej: 7540"
                labelText="Código Postal"
                value={newUser.codigo_postal || ""}
                onChange={handleChangePostal}
                validatePattern="^[0-9]{4}$"
                validationMessage="Código postal inválido, debe tener 4 dígitos numéricos"
                maxLength={8}
                required
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <SimpleSelect
                id="localidad"
                label="Localidad"
                value={newUser.localidad || ""}
                placeholder="Selecciona una localidad"
                onValueChange={(value) =>
                  handleChange({ target: { name: "localidad", value } })
                }
                required
              >
                {localidades.map((loc, index) => (
                  <SelectItem key={`${loc}-${index}`} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SimpleSelect>
              <div />{" "}
              {/* Espacio vacío para mantener el diseño de dos columnas */}
            </ResponsiveColumnForm>
          </div>

          {/* Contacto */}
          <hr className="my-6" />
          <div className="space-y-4">
            <h4 className="text-md font-medium">Contacto</h4>
            <ResponsiveColumnForm>
              <InputValidate
                id="telefono_fijo"
                maxLength={20}
                minLength={7}
                type="tel"
                labelText="Teléfono fijo"
                value={newUser.telefono_fijo || ""}
                validatePattern="^\d+$"
                validationMessage="Solo se permiten números, mínimo 7 dígitos."
              />

              <InputValidate
                id="telefono_movil"
                maxLength={20}
                minLength={7}
                type="tel"
                labelText="Teléfono móvil"
                value={newUser.telefono_movil || ""}
                required
                validatePattern="^\d+$"
                validationMessage="Solo se permiten números, mínimo 7 dígitos."
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <SimpleSelect
                id="red_social_nombre"
                label="Red social"
                value={newUser.red_social_nombre || redesSociales[0] || ""}
                placeholder="Selecciona una red social"
                onValueChange={(value) =>
                  handleChange({ target: { name: "red_social_nombre", value } })
                }
              >
                {redesSociales.map((rs) => (
                  <SelectItem key={rs} value={rs}>
                    {rs}
                  </SelectItem>
                ))}
              </SimpleSelect>

              {newUser.red_social_nombre &&
                newUser.red_social_nombre !== redesSociales[0] && (
                  <InputValidate
                    id="red_social_contacto"
                    cleanRegex={/[^a-zA-Z0-9@._-]/g}
                    maxLength={50}
                    type="text"
                    labelText={`Usuario de ${newUser.red_social_nombre}`}
                    value={newUser.red_social_contacto || ""}
                    onChange={handleChange}
                    disabled={
                      !newUser.red_social_nombre ||
                      newUser.red_social_nombre === redesSociales[0]
                    }
                  />
                )}
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="email_contacto"
                type="email"
                maxLength={50}
                labelText="Email de contacto"
                value={newUser.email_contacto || ""}
                required
              />
              <div />{" "}
              {/* Espacio vacío para mantener el diseño de dos columnas */}
            </ResponsiveColumnForm>

            <div className="w-full">
              <InputValidate
                id="observacion_contacto"
                type="text"
                maxLength={300}
                labelText="Observaciones de contacto"
                value={newUser.observacion_contacto || ""}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className={"cursor-pointer"}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className={"cursor-pointer"}>Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PersonCreateDialog;
