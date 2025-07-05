import React from "react";
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
  setEditingPerson,
  onSubmit,
  redesSociales = [],
  tiposDocumentos = [],
  localidades = [],
  loading = false,
  error = null,
}) {
  if (!editingPerson) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingPerson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setEditingPerson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!e.currentTarget.checkValidity())return;
    const formData = await formSubmitJson(e);

    const body = {
      nombre_persona: formData.nombre || "",
      apellido_persona: formData.apellido || "",
      tipo_documento: formData.tipo_documento || "DNI",
      num_doc_persona: formData.num_doc_persona || "",
      fecha_nacimiento_persona: formData.fecha_nacimiento || "",
      //usuario_id: (formData.usuario_id === "-1") ? null : formData?.usuario_id,
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
    console.warn(body)
    setEditingPerson(body);
    onSubmit(body);
  };

  const handleChangePostal = (e) => {
    const { value } = e.target;
    setEditingPerson(prev => ({
      ...prev,
      codigo_postal: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && setEditingPerson(null)}>
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
                id="nombre"
                name="nombre"
                type="text"
                labelText="Nombre"
                value={editingPerson.nombre || ""}
                onChange={handleChange}
                required
              />

              <InputValidate
                id="apellido"
                name="apellido"
                type="text"
                labelText="Apellido"
                value={editingPerson.apellido || ""}
                onChange={handleChange}
                required
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <SimpleSelect
                name="tipo_documento"
                label="Tipo de documento"
                value={editingPerson.tipo_documento || "DNI"}
                placeholder="Selecciona un tipo de documento"
                onValueChange={(value) => handleSelectChange('tipo_documento', value)}
                required
              >
                {tiposDocumentos.map((doc, i) => (
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
                value={editingPerson.documento || ""}
                onChange={handleChange}
                required
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                labelText="Fecha de nacimiento"
                value={editingPerson.fecha_nacimiento || ""}
                onChange={handleChange}
              />
            </ResponsiveColumnForm>
          </div>

          {/* Contacto */}
          <hr className="my-6" />
          <div className="space-y-4">
            <h4 className="text-md font-medium">Contacto</h4>
            <ResponsiveColumnForm>
              <InputValidate
                id="email"
                name="email"
                type="email"
                labelText="Email"
                value={editingPerson.email || ""}
                onChange={handleChange}
                required
              />

              <InputValidate
                id="telefono_movil"
                name="telefono_movil"
                type="tel"
                labelText="Teléfono móvil"
                value={editingPerson.telefono_movil || ""}
                onChange={handleChange}
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="telefono_fijo"
                name="telefono_fijo"
                type="tel"
                labelText="Teléfono fijo"
                value={editingPerson.telefono_fijo || ""}
                onChange={handleChange}
              />
            </ResponsiveColumnForm>
          </div>

          {/* Domicilio */}
          <hr className="my-6" />
          <div className="space-y-4">
            <h4 className="text-md font-medium">Domicilio</h4>
            <ResponsiveColumnForm>
              <InputValidate
                id="calle"
                name="calle"
                type="text"
                labelText="Calle"
                value={editingPerson.calle || ""}
                onChange={handleChange}
              />

              <InputValidate
                id="numero"
                name="numero"
                type="text"
                labelText="Número"
                value={editingPerson.numero || ""}
                onChange={handleChange}
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="piso"
                name="piso"
                type="text"
                labelText="Piso"
                value={editingPerson.piso || ""}
                onChange={handleChange}
              />

              <InputValidate
                id="dpto"
                name="dpto"
                type="text"
                labelText="Departamento"
                value={editingPerson.dpto || ""}
                onChange={handleChange}
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="referencia"
                name="referencia"
                type="text"
                labelText="Referencia"
                value={editingPerson.referencia || ""}
                onChange={handleChange}
              />
            </ResponsiveColumnForm>

            <ResponsiveColumnForm>
              <InputValidate
                id="codigo_postal"
                name="codigo_postal"
                type="text"
                labelText="Código Postal"
                value={editingPerson.codigo_postal || ""}
                onChange={handleChangePostal}
              />

              {localidades.length > 0 && (
                <SimpleSelect
                  name="localidad"
                  label="Localidad"
                  value={editingPerson.localidad || ""}
                  placeholder="Selecciona una localidad"
                  onValueChange={(value) => handleSelectChange('localidad', value)}
                >
                  <option value="">Seleccionar localidad</option>
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
                  name="red_social_contacto"
                  label="Red Social"
                  value={editingPerson.red_social_contacto || ""}
                  placeholder="Selecciona una red social"
                  onValueChange={(value) => handleSelectChange('red_social_contacto', value)}
                >
                  <option value="">Ninguna</option>
                  {redesSociales.map((red, index) => (
                    <SelectItem key={index} value={red}>
                      {red}
                    </SelectItem>
                  ))}
                </SimpleSelect>
              )}

              <InputValidate
                id="red_social_nombre"
                name="red_social_nombre"
                type="text"
                labelText="Usuario de la red social"
                value={editingPerson.red_social_nombre || ""}
                onChange={handleChange}
              />
            </ResponsiveColumnForm>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingPerson(null)}
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