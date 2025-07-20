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
import CPLocalidad from "@/components/CPLocalidad";

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

  const [person, setPerson] = useState(JSON.parse(JSON.stringify(editingPerson)));

  const [localidad, setLocalidad] = useState(person?.domicilio?.domicilio_postal?.localidad || "");

  const [tipoDoc, setTipoDoc] = useState(
    person?.tipo_documento || Object.keys(tiposDocumentos)[0] || ""
  );


  const handleChange = (e) => {
    const { name, value } = e.target;
    person[name] = value;
  };

  const handleSelectChange = (name, value) => {
    person[name] = value;
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
      <DialogContent className="sm:max-w-[600px] overflow-y-auto overflow-x-hidden max-h-[90vh]">
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
                maxLength={50}
                cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
                value={person.nombre_persona || ""}
                validatePattern="^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$"
                validationMessage="El nombre debe contener solo letras"
                required
              />

              <InputValidate
                id="apellido_persona"
                type="text"
                labelText="Apellido"
                maxLength={50}
                cleanRegex={/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_,.'()]/g}
                value={person.apellido_persona || ""}
                validatePattern="^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$"
                validationMessage="El apellido debe contener solo letras"
                required
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
            <SimpleSelect
                id="tipo_documento"
                label="Tipo de documento"
                value={person.tipo_documento || "DNI"}
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
                id="num_doc_persona"
                type="text"
                labelText="Nro. documento"
                maxLength={13}
                value={person.num_doc_persona || ""}
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
                value={person.fecha_nacimiento_persona || ""}
                max={today}
                validationMessage="La fecha de nacimiento es requerida"
                required
              />

              {/* Select de usuario */}
              <SimpleSelect
                id="usuario_id"
                label="Usuario del sistema"
                value={person.usuario_id || -1}
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
                maxLength={50}
                value={person.contacto?.email_contacto || ""}
                validationMessage="Email inválido"
                
                required
              />

              <InputValidate
                id="telefono_movil"
                type="tel"
                labelText="Teléfono móvil"
                validatePattern="^\+549\d{10}$"
                value={person.contacto?.telefono_movil || ""}
                maxLength={20}
                validationMessage="Ingresa un número de teléfono válido EJ: +5492926396430"
                required
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="telefono_fijo"
                type="tel"
                labelText="Teléfono fijo"
                maxLength={20}
                validatePattern="^\+549\d{10}$" 
                value={person.contacto?.telefono_fijo || ""}
                validationMessage="Ingresa un número de teléfono válido EJ: +5492926396430"
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
                maxLength={50}
                value={person.domicilio?.domicilio_calle || ""}
                validatePattern="^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9]+)*$"
                validationMessage="Ingresa un nombre de calle válido, sólo se permiten letras, números y un espacio entre cada palabra"
                required
              />

              <InputValidate
                id="domicilio_numero"
                type="text"
                labelText="Número"
                maxLength={10}
                value={person.domicilio?.domicilio_numero || ""}
                validatePattern="^([0-9]{1,9}[a-zA-Z]?|[Ss][Nn])$"
                validationMessage="Ingresa un número válido (ej: 1234, 123A, SN)"
                required
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="domicilio_piso"
                type="text"
                labelText="Piso"
                maxLength={3}
                value={person.domicilio?.domicilio_piso || ""}
                validatePattern="^[0-9]{1,2}[A-Za-z]?$|^[Pp][Bb]$"
                validationMessage="Formato de piso inválido. Ejemplos válidos: '3', '3A', 'PB'"
              />

              <InputValidate
                id="domicilio_dpto"
                type="text"
                labelText="Departamento"
                maxLength={2}
                value={person.domicilio?.domicilio_dpto || ""}
                validatePattern="^[a-zA-Z0-9]{1,2}$|^$"
                validationMessage="Ingresa un departamento válido (máximo 2 caracteres)"
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="domicilio_referencia"
                type="text"
                labelText="Referencia"
                maxLength={200}
                value={person.domicilio?.domicilio_referencia || ""}
                validationMessage="Máximo 200 caracteres"
              />
            </ResponsiveColumnForm>
            <CPLocalidad localidad={localidad} codigo_postal={person.domicilio?.domicilio_postal?.codigo_postal || ""} setLocalidad={setLocalidad} />
          </div>

          {/* Redes Sociales */}
          <hr className="my-6" />
          <div className="space-y-4">
            <h4 className="text-md font-medium">Redes Sociales</h4>
            <ResponsiveColumnForm>
              {redesSociales.length > 0 && (
                <SimpleSelect
                  id="red_social_nombre"
                  label="Red Social"
                  value={person.contacto?.red_social_nombre || ""}
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
                cleanRegex={/[^a-zA-Z0-9@._-]/g}
                type="text"
                labelText="Usuario de la red social"
                maxLength={50}
                value={person.contacto?.red_social_contacto || ""}
                onChange={handleChange}
                validationMessage="Caracteres invalidos"
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