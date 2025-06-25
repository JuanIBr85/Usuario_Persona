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
import PersonFilter from "@/components/people/PersonFilter";
import Loading from "@/components/loading/Loading";

import { PersonaService } from "@/services/personaService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PersonTable from "@/components/people/PersonTable";
import PersonEditDialog from "@/components/people/PersonEditDialog";
import PersonBreadcrumb from "@/components/people/PersonBreadcrumb";

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
function AdminUsers() {
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
    e.preventDefault();

    try {
      const body = {
        nombre_persona: newUser.nombre || "",
        apellido_persona: newUser.apellido || "",
        fecha_nacimiento_persona: newUser.fecha_nacimiento || "",
        tipo_documento: newUser.tipo_documento || "DNI",
        num_doc_persona: newUser.nro_documento || "",
        usuario_id: newUser.usuario_id || null,
        domicilio: {
          domicilio_calle: newUser.domicilio_calle || "",
          domicilio_numero: newUser.domicilio_numero || "",
          domicilio_piso: newUser.domicilio_piso || "",
          domicilio_dpto: newUser.domicilio_dpto || "",
          domicilio_referencia: newUser.domicilio_referencia || "",
          codigo_postal: {
            codigo_postal: newUser.codigo_postal || "",
            localidad: newUser.localidad || "",
          },
        },
        contacto: {
          telefono_fijo: newUser.telefono_fijo || "",
          telefono_movil: newUser.telefono_movil || "",
          red_social_contacto: newUser.red_social_contacto || "",
          red_social_nombre: newUser.red_social_nombre || "",
          email_contacto: newUser.email_contacto || "",
          observacion_contacto: newUser.observacion_contacto || "",
        },
      };

      await PersonaService.crear(body);

      const newUserForTable = {
        id: null,
        nombre: newUser.nombre || "",
        apellido: newUser.apellido || "",
        tipo_documento: newUser.tipo_documento || "DNI",
        nro_documento: newUser.nro_documento || "",
        fecha_nacimiento: newUser.fecha_nacimiento || "",
        usuario_id: newUser.usuario_id || null,
      };

      setUsers((prevUsers) => [...prevUsers, newUserForTable]);
      setNewUser({});
    } catch (error) {
      console.error("Error al crear persona:", error);
      //const message = error?.response?.data?.message || error.message || "Error desconocido";

      setAlert({
        title: "Error al crear persona",
        description: "",
      });
    }
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setNewUser((prevValues) => ({ ...prevValues, [name]: value }));
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
              Usuarios Registrados
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
            <Dialog>
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
                    <Label>ID Usuario</Label>
                    <Input
                      name="usuario_id"
                      value={newUser.usuario_id || ""}
                      onChange={handleChange}
                    />
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
      />
    </div>
  );
}

export default AdminUsers;
