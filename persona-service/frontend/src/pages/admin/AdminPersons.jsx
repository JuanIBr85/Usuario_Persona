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

  // Carga inicial de usuarios al montar el componente
  useEffect(() => {
    PersonaService.get_all()
      .then((res) => {
        if (res && res.data && Array.isArray(res.data)) {
          const mappedUsers = res.data.map((persona) => ({
            id: persona.id_persona,
            nombre: persona.nombre_persona,
            apellido: persona.apellido_persona,
            tipo_documento: persona.tipo_documento,
            nro_documento: persona.num_doc_persona,
            fecha_nacimiento: persona.fecha_nacimiento_persona,
            usuario_id: persona.usuario_id,
          }));
          console.log("mappedUsers:", mappedUsers);
          setUsers(mappedUsers);
        }
      })
      .catch((err) => {
        console.error("Error obteniendo usuarios:", err);
      });
  }, []);

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
      console.error("Error actualizando usuario:", err);

      const message =
        err?.response?.data?.message || err.message || "Error desconocido";

      setAlert({
        title: "Error al actualizar usuario",
        description: message,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      nombre_persona: newUser.nombre_persona || "",
      apellido_persona: newUser.apellido_persona || "",
      fecha_nacimiento_persona: newUser.fecha_nacimiento_persona || "",
      tipo_documento: newUser.tipo_documento || "DNI",
      num_doc_persona: newUser.num_doc_persona || "",
      usuario_id: newUser.usuario_id || null,
      domicilio: {
        domicilio_calle: newUser.domicilio?.domicilio_calle || "",
        domicilio_numero: newUser.domicilio?.domicilio_numero || "",
        domicilio_piso: newUser.domicilio?.domicilio_piso || "",
        domicilio_dpto: newUser.domicilio?.domicilio_dpto || "",
        domicilio_referencia: newUser.domicilio?.domicilio_referencia || "",
        codigo_postal: {
          codigo_postal: newUser.domicilio?.codigo_postal?.codigo_postal || "",
          localidad: newUser.domicilio?.codigo_postal?.localidad || "",
        },
      },
      contacto: {
        telefono_fijo: newUser.contacto?.telefono_fijo || "",
        telefono_movil: newUser.contacto?.telefono_movil || "",
        red_social_contacto: newUser.contacto?.red_social_contacto || "",
        red_social_nombre: newUser.contacto?.red_social_nombre || "",
        email_contacto: newUser.contacto?.email_contacto || "",
        observacion_contacto: newUser.contacto?.observacion_contacto || "",
      },
    };
    PersonaService.crear(body);
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
        {alert && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
            <button
              onClick={() => setAlert(null)}
              className="ml-auto bg-transparent text-red-600 hover:text-red-800 font-semibold"
            >
              Cerrar
            </button>
          </Alert>
        )}
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
              <Dialog>
                <form onSubmit={handleSubmit}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus /> Agregar Persona
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Agregar Persona</DialogTitle>
                      <DialogDescription>
                        Agrega una persona a la base de datos.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                      {/* Nombre */}
                      <div className="grid gap-3">
                        <Label htmlFor="nombre_persona">Nombre</Label>
                        <Input
                          id="nombre_persona"
                          name="nombre_persona"
                          type="text"
                          value={newUser.nombre_persona || ""}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Apellido */}
                      <div className="grid gap-3">
                        <Label htmlFor="apellido_persona">Apellido</Label>
                        <Input
                          id="apellido_persona"
                          name="apellido_persona"
                          type="text"
                          value={newUser.apellido_persona || ""}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Fecha de nacimiento */}
                      <div className="grid gap-3">
                        <Label htmlFor="fecha_nacimiento_persona">
                          Fecha de nacimiento
                        </Label>
                        <Input
                          id="fecha_nacimiento_persona"
                          name="fecha_nacimiento_persona"
                          type="date"
                          value={newUser.fecha_nacimiento_persona || ""}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Tipo de documento */}
                      <div className="grid gap-3">
                        <Label htmlFor="tipo_documento">
                          Tipo de documento
                        </Label>
                        <Input
                          id="tipo_documento"
                          name="tipo_documento"
                          type="text"
                          value={newUser.tipo_documento || ""}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Número de documento */}
                      <div className="grid gap-3">
                        <Label htmlFor="num_doc_persona">
                          Número de documento
                        </Label>
                        <Input
                          id="num_doc_persona"
                          name="num_doc_persona"
                          type="text"
                          value={newUser.num_doc_persona || ""}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Usuario ID */}
                      <div className="grid gap-3">
                        <Label htmlFor="usuario_id">Usuario ID</Label>
                        <Input
                          id="usuario_id"
                          name="usuario_id"
                          type="number"
                          value={newUser.usuario_id || ""}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Domicilio */}
                      <h3 className="mt-4 font-semibold">Domicilio</h3>

                      <div className="grid gap-3">
                        <Label htmlFor="domicilio_calle">Calle</Label>
                        <Input
                          id="domicilio_calle"
                          name="domicilio.domicilio_calle"
                          type="text"
                          value={newUser.domicilio?.domicilio_calle || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="domicilio_numero">Número</Label>
                        <Input
                          id="domicilio_numero"
                          name="domicilio.domicilio_numero"
                          type="text"
                          value={newUser.domicilio?.domicilio_numero || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="domicilio_piso">Piso</Label>
                        <Input
                          id="domicilio_piso"
                          name="domicilio.domicilio_piso"
                          type="text"
                          value={newUser.domicilio?.domicilio_piso || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="domicilio_dpto">Departamento</Label>
                        <Input
                          id="domicilio_dpto"
                          name="domicilio.domicilio_dpto"
                          type="text"
                          value={newUser.domicilio?.domicilio_dpto || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="domicilio_referencia">Referencia</Label>
                        <Input
                          id="domicilio_referencia"
                          name="domicilio.domicilio_referencia"
                          type="text"
                          value={newUser.domicilio?.domicilio_referencia || ""}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Código postal y localidad */}
                      <div className="grid gap-3">
                        <Label htmlFor="codigo_postal">Código Postal</Label>
                        <Input
                          id="codigo_postal"
                          name="domicilio.codigo_postal.codigo_postal"
                          type="text"
                          value={
                            newUser.domicilio?.codigo_postal?.codigo_postal ||
                            ""
                          }
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="localidad">Localidad</Label>
                        <Input
                          id="localidad"
                          name="domicilio.codigo_postal.localidad"
                          type="text"
                          value={
                            newUser.domicilio?.codigo_postal?.localidad || ""
                          }
                          onChange={handleChange}
                        />
                      </div>

                      {/* Contacto */}
                      <h3 className="mt-4 font-semibold">Contacto</h3>

                      <div className="grid gap-3">
                        <Label htmlFor="telefono_fijo">Teléfono fijo</Label>
                        <Input
                          id="telefono_fijo"
                          name="contacto.telefono_fijo"
                          type="text"
                          value={newUser.contacto?.telefono_fijo || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="telefono_movil">Teléfono móvil</Label>
                        <Input
                          id="telefono_movil"
                          name="contacto.telefono_movil"
                          type="text"
                          value={newUser.contacto?.telefono_movil || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="red_social_contacto">
                          Red social (usuario)
                        </Label>
                        <Input
                          id="red_social_contacto"
                          name="contacto.red_social_contacto"
                          type="text"
                          value={newUser.contacto?.red_social_contacto || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="red_social_nombre">
                          Red social (nombre)
                        </Label>
                        <Input
                          id="red_social_nombre"
                          name="contacto.red_social_nombre"
                          type="text"
                          value={newUser.contacto?.red_social_nombre || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="email_contacto">Email</Label>
                        <Input
                          id="email_contacto"
                          name="contacto.email_contacto"
                          type="email"
                          value={newUser.contacto?.email_contacto || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="observacion_contacto">
                          Observaciones
                        </Label>
                        <Input
                          id="observacion_contacto"
                          name="contacto.observacion_contacto"
                          type="text"
                          value={newUser.contacto?.observacion_contacto || ""}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit">Agregar</Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            </div>
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
