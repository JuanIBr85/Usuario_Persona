import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import InputValidate from "@/components/inputValidate/InputValidate";
import SimpleSelect from "@/components/SimpleSelect";
import PersonFilter from "@/components/people/PersonFilter";
import Loading from "@/components/loading/Loading";

import { PersonaService } from "@/services/personaService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PersonTable from "@/components/people/PersonTable";
import PersonEditDialog from "@/components/people/PersonEditDialog";
import PersonBreadcrumb from "@/components/people/PersonBreadcrumb";
import { SelectItem } from "@/components/ui/select";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";
import { formSubmitJson } from "@/utils/formUtils";
/**
 * Componente AdminUsers
 * ---------------------
 * Este componente muestra una lista de usuarios registrados,
 * con funcionalidades para filtrarlos, editar sus datos,
 * ver detalles y eliminarlos.
 *
 * Estado:
 * - editingUser: usuario que se está editando (null si no hay ninguno).
 * - users: lista completa de usuarios obtenida desde el servicio.
 * - mostrarFiltroAvanzado: controla si se muestra o no el filtro avanzado.
 * - filtro: texto para filtrar usuarios por nombre o email.
 *
 * Efectos:
 * - Al montar, carga la lista completa de usuarios desde PersonaService.
 *
 * Funcionalidades principales:
 * - Filtrado dinámico de usuarios según texto ingresado.
 * - Eliminación de usuarios con actualización inmediata de la lista.
 * - Navegación a pantalla de detalles de un usuario.
 * - Edición rápida de usuario mediante diálogo modal.
 *
 * Componentes hijos usados:
 * - PersonFilter: formulario para filtrar usuarios.
 * - PersonTable: tabla que muestra la lista filtrada con botones de acción.
 * - PersonEditDialog: diálogo modal para editar datos de usuario.
 * - PersonBreadcrumb: barra de navegación breadcrumb.
 */
function AdminPersons() {
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({});

  // Estado para usuario en edición
  const [editingUser, setEditingUser] = useState(null);
  // Lista completa de usuarios
  const [users, setUsers] = useState([]);
  // Control de filtro avanzado
  const [mostrarFiltroAvanzado, setMostrarFiltroAvanzado] = useState(false);
  // Texto del filtro
  const [filtro, setFiltro] = useState("");
  const [alert, setAlert] = useState(null);

  const [redesSociales, setRedesSociales] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [tiposDocumentos, setTiposDocumentos] = useState([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Carga inicial de usuarios al montar el componente
  useEffect(() => {
    PersonaService.get_all()
      .then((res) => {
        if (res && res.data && Array.isArray(res.data)) {
          const mappedUsers = res.data.map((persona) => ({
            id: persona.id_persona,
            usuario_id: persona.usuario_id,

            nombre: persona.nombre_persona,
            apellido: persona.apellido_persona,
            tipo_documento: persona.tipo_documento,
            nro_documento: persona.num_doc_persona,
            fecha_nacimiento: persona.fecha_nacimiento_persona,
          }));
          console.log("mappedUsers:", mappedUsers);
          setUsers(mappedUsers);
        }
      })
      .catch((err) => {
        console.error("Error obteniendo usuarios:", err);
      });
  }, []);

  useEffect(() => {
    PersonaService.get_redes_sociales().then((res) => {
      setRedesSociales(res?.data || []);
    });
    PersonaService.get_tipos_documentos().then((res) => {
      setTiposDocumentos(res?.data || []);
    });
  }, []);
  console.log("get_tipos_documentos", tiposDocumentos);

  useEffect(() => {
    if (newUser.codigo_postal?.length >= 4) {
      PersonaService.get_localidades_by_codigo_postal(
        newUser.codigo_postal
      ).then((res) => {
        setLocalidades(res?.data || []);
      });
    }
    console.log("localidades", localidades);
  }, [newUser.codigo_postal]);

  // Filtra usuarios según texto en nombre, apellido o email (insensible a mayúsculas)
  const usuariosFiltrados = users.filter((user) => {
    const textoMatch =
      `${user.nombre} ${user.apellido}`
        .toLowerCase()
        .includes(filtro.toLowerCase()) ||
      user.nro_documento.toLowerCase().includes(filtro.toLowerCase());
    return textoMatch;
  });
  console.log("usuariosFiltrados", usuariosFiltrados);

  /**
   * Elimina un usuario por id.
   * Actualiza la lista local tras eliminar exitosamente.
   * @param {number} id - ID del usuario a eliminar
   */
  const handleDelete = (id) => {
    PersonaService.borrar(id)
      .then(() => {
        setUsers(users.filter((user) => user.id !== id));
      })
      .catch((err) => {
        console.error("Error eliminando usuario:", err);
      });
  };

  /**
   * Navega a la pantalla de detalles del usuario.
   * @param {number} id - ID del usuario
   */
  const handleSeeDetails = (id) => {
    navigate(`/persondetails/${id}`);
  };

  /**
   * Maneja el envío del formulario de edición.
   * Actualiza el usuario en la lista local y hace petición para actualizar en backend.
   * @param {Event} e - Evento submit del formulario
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Construye el body con todos los campos para enviar al backend
    const body = {
      nombre_persona: editingUser.nombre || "",
      apellido_persona: editingUser.apellido || "",
      tipo_documento: editingUser.tipo_documento || "DNI",
      num_doc_persona: editingUser.nro_documento || "",
      fecha_nacimiento_persona: editingUser.fecha_nacimiento || "",
      usuario_id: editingUser.usuario_id || null,
    };

    try {
      await PersonaService.editar(editingUser.id, body);

      // Actualiza el estado local solo si la petición fue exitosa
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
    } catch (err) {
      console.error("Error actualizando persona:", err);

      //const message = err?.response?.data?.message || err.message || "Error desconocido";
      setAlert({
        title: "Error al actualizar persona",
        description: "",
      });
    }
    console.log("message", message);
  };

  const handleSubmit = async (e) => {
    const formData = await formSubmitJson(e);
    e.preventDefault();

    try {
      const body = {
        nombre_persona: formData.nombre || "",
        apellido_persona: formData.apellido || "",
        fecha_nacimiento_persona: formData.fecha_nacimiento || "",
        tipo_documento: formData.tipo_documento || "DNI",
        num_doc_persona: formData.nro_documento || "",
        usuario_id: formData.usuario_id || null,
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

      await PersonaService.crear(body);

      const newUserForTable = {
        id: null,
        nombre: formData.nombre || "",
        apellido: formData.apellido || "",
        tipo_documento: formData.tipo_documento || "DNI",
        nro_documento: formData.nro_documento || "",
        fecha_nacimiento: formData.fecha_nacimiento || "",
        usuario_id: formData.usuario_id || null,
      };

      setUsers((prevUsers) => [...prevUsers, newUserForTable]);
      setNewUser({});
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al crear persona:", error);
      //const message = error?.response?.data?.message || error.message || "Error desconocido";

      setAlert({
        title: "Error al crear persona",
        description: "",
      });
      setIsDialogOpen(false);
    }
  };

  const handleChangePostal = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setNewUser((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    if (name !== "codigo_postal") {
      setNewUser((prevValues) => ({ ...prevValues, [name]: value }));
    }
  };

  // Muestra loader si aún no hay usuarios cargados
  if (!users) return <Loading />;

  return (
    <div className="p-6 space-y-6 py-30 px-3 md:py-25 md:px-15">
      <Fade duration={300} triggerOnce>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Personas Cargadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filtro de usuario */}
            <div className="overflow-auto border p-3 rounded-md shadow-sm mb-4">
              <PersonFilter
                mostrarFiltroAvanzado={mostrarFiltroAvanzado}
                setMostrarFiltroAvanzado={setMostrarFiltroAvanzado}
                filtro={filtro}
                setFiltro={setFiltro}
              />
            </div>

            {/* Tabla con usuarios filtrados */}
            <div className="overflow-auto border p-3 rounded-md shadow-sm">
              <PersonTable
                users={usuariosFiltrados}
                onEdit={setEditingUser}
                onSeeDetails={handleSeeDetails}
                onDelete={handleDelete}
              />
            </div>
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
                      <InputValidate
                        id="domicilio_dpto"
                        name="domicilio_dpto"
                        type="text"
                        labelText="Departamento"
                        value={newUser.domicilio_dpto || ""}
                      />
                    </ResponsiveColumnForm>

                    <ResponsiveColumnForm>
                    <InputValidate
                        id="codigo_postal"
                        name="codigo_postal"
                        type="text"
                        labelText="Código Postal"
                        value={newUser.codigo_postal || ""}
                        onChange={handleChangePostal}
                        required
                      />
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

            {alert && (
              <Alert variant="destructive" className="mb-4 mt-3">
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
                <Button variant="outline"
                  onClick={() => setAlert(null)}
                  className="ml-auto bg-transparent text-red-600 hover:text-red-800 font-semibold"
                >
                  Cerrar
                </Button>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Breadcrumb navegación */}
        <PersonBreadcrumb />
      </Fade>

      {/* Diálogo modal para editar usuario */}
      <PersonEditDialog
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        onSubmit={handleEditSubmit}
        tiposDocumentos={tiposDocumentos}
      />
    </div>
  );
}

export default AdminPersons;
