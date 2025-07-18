import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import SimpleSelect from "@/components/SimpleSelect";
import { SelectItem } from "@/components/ui/select";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";
import { formSubmitJson } from "@/utils/formUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function PersonEditDialog({
  open,
  editingPerson,
  changePostal,
  onSubmit,
  setIsDialogOpen,
  redesSociales = [],
  tiposDocumentos = [],
  localidades = [],
  loading = false,
  usuarios = [],
  error = null,
}) {
  if (!editingPerson) return null;

  const [tipoDoc, setTipoDoc] = useState(
    editingPerson?.tipo_documento || Object.keys(tiposDocumentos)[0] || ""
  );


  const handleChange = (e) => {
    const { name, value } = e.target;
    editingPerson[name] = value;
  };

  const handleSelectChange = (name, value) => {
    editingPerson[name] = value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return;
    const formData = await formSubmitJson(e);

    const body = {
      nombre_persona: formData.nombre_persona || "",
      apellido_persona: formData.apellido_persona || "",
      fecha_nacimiento_persona: formData.fecha_nacimiento || "",
      tipo_documento: formData.tipo_documento || "DNI",
      num_doc_persona: formData.num_doc_persona || "",
      usuario_id: formData?.usuario_id,
      domicilio: {
        domicilio_calle: formData.domicilio_calle || "",
        domicilio_numero: formData.domicilio_numero || "",
        domicilio_piso: formData.domicilio_piso || "",
        domicilio_dpto: formData.domicilio_dpto || "",
        domicilio_referencia: formData.domicilio_referencia || "",
        codigo_postal: {
          codigo_postal: formData.codigo_postal || "",
          localidad: formData.localidad || "",
        },
      },
      contacto: {
        telefono_fijo: formData.telefono_fijo || "",
        telefono_movil: formData.telefono_movil || "",
        red_social_contacto: formData.red_social_contacto || "",
        red_social_nombre: formData.red_social_nombre || "",
        email_contacto: formData.email_contacto || "",
        observacion_contacto: formData.observacion_contacto || "",
      },
    };
    onSubmit(body);
  };

  const handleChangePostal = (e) => {
    const { value } = e.target;

    if (value.length !== 4) return;
    changePostal(value);
  };

  // es la fecha actual para limitar la fecha de nacimiento
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && setIsDialogOpen(false)}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Persona</DialogTitle>
          <DialogDescription>
            Modificá los datos de la persona y guarda los cambios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos personales */}
          <div className="space-y-4">
            <h4 className="text-md font-medium">Datos Personales</h4>
            <ResponsiveColumnForm>
              <InputValidate
                id="nombre_persona"
                type="text"
                labelText="Nombre"
                cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
                value={editingPerson.nombre_persona || ""}
                required
              />

              <InputValidate
                id="apellido_persona"
                type="text"
                labelText="Apellido"
                cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
                value={editingPerson.apellido_persona || ""}
                required
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <SimpleSelect
                name="tipo_documento"
                label="Tipo de documento"
                value={editingPerson.tipo_documento || tipoDoc}
                placeholder="Selecciona un tipo de documento"
                onValueChange={(value) => {
                  setTipoDoc(value);
                  handleSelectChange('tipo_documento', value);
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
                id="documento"
                name="num_doc_persona"
                type="text"
                labelText="Nro. documento"
                value={editingPerson.num_doc_persona || ""}
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
                value={editingPerson.fecha_nacimiento_persona || ""}
                max={today}
              />

              {/* Select de usuario */}
              <SimpleSelect
                name="usuario_id"
                label="Usuario del sistema"
                value={editingPerson.usuario_id || -1}
                placeholder="Selecciona un usuario"
              >
                <SelectItem value={-1} default>Ningún usuario</SelectItem>
                {loading && (
                  <SelectItem disabled>Cargando usuarios...</SelectItem>
                )}
                {error && (
                  <SelectItem disabled>{error}</SelectItem>
                )}
                {usuarios.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nombre_usuario} {u.email_usuario}
                  </SelectItem>
                ))}
              </SimpleSelect>
            </ResponsiveColumnForm>
          </div>

          {/* Contacto */}
          <hr className="my-6" />
          <div className="space-y-4">
            <h4 className="text-md font-medium">Contacto</h4>
            <ResponsiveColumnForm>
              <InputValidate
                id="email_contacto"
                type="email"
                labelText="Email"
                value={editingPerson.contacto?.email_contacto || ""}
                required
              />

              <InputValidate
                id="telefono_movil"
                type="tel"
                labelText="Teléfono móvil"
                value={editingPerson.contacto?.telefono_movil || ""}
                required
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="telefono_fijo"
                type="tel"
                labelText="Teléfono fijo"
                value={editingPerson.contacto?.telefono_fijo || ""}
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
                type="text"
                labelText="Calle"
                value={editingPerson.domicilio?.domicilio_calle || ""}
              />

              <InputValidate
                id="domicilio_numero"
                type="text"
                labelText="Número"
                value={editingPerson.domicilio?.domicilio_numero || ""}
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="domicilio_piso"
                type="text"
                labelText="Piso"
                value={editingPerson.domicilio?.domicilio_piso || ""}
              />

              <InputValidate
                id="domicilio_dpto"
                type="text"
                labelText="Departamento"
                value={editingPerson.domicilio?.domicilio_dpto || ""}
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="domicilio_referencia"
                type="text"
                labelText="Referencia"
                value={editingPerson.domicilio?.domicilio_referencia || ""}
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="codigo_postal"
                type="text"
                labelText="Código Postal"
                value={editingPerson.domicilio?.domicilio_postal?.codigo_postal || ""}
                onChange={handleChangePostal}
              />

              {localidades.length > 0 && (
                <SimpleSelect
                  name="localidad"
                  label="Localidad"
                  value={editingPerson.domicilio?.domicilio_postal?.localidad || ""}
                  placeholder="Selecciona una localidad"
                  required={true}
                >
                  <SelectItem>Seleccionar localidad</SelectItem>
                  {localidades.map((loc, index) => (
                    <SelectItem key={index} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SimpleSelect>
              )}
            </ResponsiveColumnForm>
          </div>

          {/* Redes Sociales */}
          <hr className="my-6" />
          <div className="space-y-4">
            <h4 className="text-md font-medium">Redes Sociales</h4>
            <ResponsiveColumnForm>
              {redesSociales.length > 0 && (
                <SimpleSelect
                  name="red_social_nombre"
                  label="Red Social"
                  value={editingPerson.contacto?.red_social_nombre || ""}
                  placeholder="Selecciona una red social"
                  onValueChange={(value) => handleSelectChange('red_social_nombre', value)}
                >
                  {redesSociales.map((red, index) => (
                    <SelectItem key={index} value={red}>
                      {red}
                    </SelectItem>
                  ))}
                </SimpleSelect>
              )}

              <InputValidate
                id="red_social_contacto"
                name="red_social_contacto"
                cleanRegex={/[^a-zA-Z0-9@._-]/g}
                type="text"
                labelText="Usuario de la red social"
                value={editingPerson.contacto?.red_social_contacto || ""}
                onChange={handleChange}
              />
            </ResponsiveColumnForm>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className={"cursor-pointer"}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PersonEditDialog;