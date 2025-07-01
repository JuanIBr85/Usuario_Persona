import React from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PersonEditDialog({
  open,
  editingPerson,
  setEditingPerson,
  onSubmit,
  redesSociales,
  tiposDocumentos,
  localidades,
}) {
  if (!editingPerson) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = {
      nombre_persona: editingPerson.nombre,
      apellido_persona: editingPerson.apellido,
      tipo_documento: editingPerson.tipo_documento || "",
      num_doc_persona: editingPerson.documento || "",
      fecha_nacimiento_persona: editingPerson.fecha_nacimiento || "",
      domicilio: {
        domicilio_calle: editingPerson.calle,
        domicilio_numero: editingPerson.numero,
        domicilio_piso: editingPerson.piso,
        domicilio_dpto: editingPerson.dpto,
        domicilio_referencia: editingPerson.referencia,
        codigo_postal: {
          codigo_postal: editingPerson.codigo_postal,
          localidad: editingPerson.localidad,
          partido: editingPerson.partido,
          provincia: editingPerson.provincia,
        },
      },
      contacto: {
        telefono_movil: editingPerson.telefono_movil || "",
        telefono_fijo: editingPerson.telefono_fijo || "",
        red_social_contacto: editingPerson.red_social_contacto || null,
        red_social_nombre: editingPerson.red_social_nombre || null,
        email_contacto: editingPerson.email || "",
      },
    };
    onSubmit(body);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && setEditingPerson(null)}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Persona</DialogTitle>
          <DialogDescription>
            Modifica los datos de la persona.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={editingPerson.nombre}
                onChange={(e) =>
                  setEditingPerson({ ...editingPerson, nombre: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={editingPerson.apellido}
                onChange={(e) =>
                  setEditingPerson({ ...editingPerson, apellido: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editingPerson.email}
                onChange={(e) =>
                  setEditingPerson({ ...editingPerson, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={editingPerson.telefono_movil}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    telefono_movil: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calle">Calle</Label>
              <Input
                id="calle"
                value={editingPerson.calle}
                onChange={(e) =>
                  setEditingPerson({ ...editingPerson, calle: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={editingPerson.numero}
                onChange={(e) =>
                  setEditingPerson({ ...editingPerson, numero: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="piso">Piso</Label>
              <Input
                id="piso"
                value={editingPerson.piso}
                onChange={(e) =>
                  setEditingPerson({ ...editingPerson, piso: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dpto">Dpto</Label>
              <Input
                id="dpto"
                value={editingPerson.dpto}
                onChange={(e) =>
                  setEditingPerson({ ...editingPerson, dpto: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referencia">Referencia</Label>
              <Input
                id="referencia"
                value={editingPerson.referencia}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    referencia: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codigo_postal">Código Postal</Label>
              <Input
                id="codigo_postal"
                value={editingPerson.codigo_postal}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    codigo_postal: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="localidad">Localidad</Label>
              {localidades.length > 0 ? (
                <select
                  id="localidad"
                  className="border rounded px-2 py-1"
                  value={editingPerson.localidad}
                  onChange={(e) =>
                    setEditingPerson({
                      ...editingPerson,
                      localidad: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar localidad</option>
                  {localidades.map((loc, index) => (
                    <option key={index} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="localidad"
                  value={editingPerson.localidad}
                  onChange={(e) =>
                    setEditingPerson({
                      ...editingPerson,
                      localidad: e.target.value,
                    })
                  }
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="partido">Partido</Label>
              <Input
                id="partido"
                value={editingPerson.partido}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    partido: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provincia">Provincia</Label>
              <Input
                id="provincia"
                value={editingPerson.provincia}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    provincia: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={editingPerson.fecha_nacimiento || ""}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    fecha_nacimiento: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo_documento">Tipo de documento</Label>
              <select
                id="tipo_documento"
                className="border rounded px-2 py-1"
                value={editingPerson.tipo_documento || ""}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    tipo_documento: e.target.value,
                  })
                }
              >
                <option value="">Seleccionar tipo</option>
                {tiposDocumentos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="documento">Número de Documento</Label>
              <Input
                id="documento"
                value={editingPerson.documento || ""}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    documento: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="red_social_nombre">Red Social</Label>
              <select
                id="red_social_nombre"
                className="border rounded px-2 py-1"
                value={editingPerson.red_social_nombre || ""}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    red_social_nombre: e.target.value,
                  })
                }
              >
                <option value="">Seleccionar red</option>
                {redesSociales.map((red) => (
                  <option key={red} value={red}>
                    {red}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="red_social_contacto">
                Usuario de Red Social
              </Label>
              <Input
                id="red_social_contacto"
                value={editingPerson.red_social_contacto || ""}
                onChange={(e) =>
                  setEditingPerson({
                    ...editingPerson,
                    red_social_contacto: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PersonEditDialog;