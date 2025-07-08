import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, X } from "lucide-react";

import PersonFilter from "@/components/people/PersonFilter";
import Loading from "@/components/loading/Loading";

import { PersonaService } from "@/services/personaService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PersonTable from "@/components/people/PersonTable";
import PersonEditDialog from "@/components/people/PersonEditDialog";
import PersonBreadcrumb from "@/components/people/PersonBreadcrumb";
import { formSubmitJson } from "@/utils/formUtils";
import { usePersonas } from "@/hooks/people/usePersonas";
import { useUsuariosBasic } from "@/hooks/users/useUsuariosBasic";

import PersonCreateDialog from "@/components/people/PersonCreateDialog";

/**
 * Componente AdminUsers
 * ---------------------
 * Este componente muestra una lista de usuarios registrados,
 * con funcionalidades para filtrarlos, editar sus datos,
 * ver detalles y eliminarlos.
 *
 * Estado:
 * - editingUser: usuario que se está editando (null si no hay ninguno).
 * - personas: lista completa de personas obtenida desde el servicio.
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
  const [editingUser, setEditingUser] = useState(null);
  const [mostrarFiltroAvanzado, setMostrarFiltroAvanzado] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Usar el hook usePersonas para manejar la lógica de personas
  // personas y setPersonas hacen referencias a personas, el nombre debe cambiarse a personas
  // para evitar confusiones con el concepto de usuario (User) en el sistema.
  const {
    personas,
    setPersonas,
    tiposDocumentos,
    redesSociales,
    localidades,
    alert,
    setAlert,
    fetchLocalidadesPorCodigoPostal,
    handleDelete,
    handleEditSubmit: handleEditSubmitHook,
    setLocalidades,
  } = usePersonas();

  console.log("Personas obtenidas:", personas);
  const {
    usuarios,
    loading,
    error,
  } = useUsuariosBasic();

  console.log("Usuarios obtenidos:", usuarios);

  // Efecto para cargar localidades cuando cambia el código postal
  useEffect(() => {
    if (newUser.codigo_postal?.length >= 4) {
      fetchLocalidadesPorCodigoPostal(newUser.codigo_postal);
    } else {
      setLocalidades([]);
    }
  }, [newUser.codigo_postal]);

  // Filtra personas según texto en nombre, apellido o documento (insensible a mayúsculas)
  const personasFiltradas = personas.filter((user) => {
    const textoMatch =
      `${user.nombre} ${user.apellido}`
        .toLowerCase()
        .includes(filtro.toLowerCase()) ||
      (user.nro_documento && user.nro_documento.toLowerCase().includes(filtro.toLowerCase()));
    return textoMatch;
  });

  /**
   * Navega a la pantalla de detalles del usuario.
   * @param {number} id - ID del usuario
   */
  const handleSeeDetails = (id) => {
    navigate(`/persondetails/${id}`);
  };

  /**
   * Maneja el envío del formulario de edición.
   * @param {Event} e - Evento submit del formulario
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Crea una copia del usuario y transforma usuario_id a number si corresponde
    const userForSubmit = {
      ...editingUser,
      usuario_id:
        editingUser.usuario_id && editingUser.usuario_id !== "none"
          ? Number(editingUser.usuario_id)
          : null,
    };

    const result = await handleEditSubmitHook(e, userForSubmit);
    if (result?.success) {
      setEditingUser(null);
    }
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

      await PersonaService.crear(body).then((res) => {
        const newUserForTable = {
          id: res?.data?.id_persona,
          nombre: formData.nombre || "",
          apellido: formData.apellido || "",
          tipo_documento: formData.tipo_documento || "DNI",
          nro_documento: formData.nro_documento || "",
          fecha_nacimiento: formData.fecha_nacimiento || "",
          usuario_id: formData.usuario_id || "",
        };

        setPersonas((prevPersonas) => [...prevPersonas, newUserForTable]);
        setNewUser({});
        setIsDialogOpen(false);
      });


    } catch (error) {
      console.error("Error al crear persona:", error);
      const rawMsg = error?.data?.error?.server || error?.data?.message || error.message || "Error desconocido";
      console.log("Error al crear persona:", rawMsg);
      setAlert({
        title: "Error al crear persona",
        description: rawMsg,
        variant: "destructive"
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

  // Muestra loader si aún no hay personas cargadas
  if (!personas) return <Loading />;

  return (
    <div className="p-6 space-y-6 py-15 px-3 md:py-10 md:px-15">
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

            {/* Tabla con personas filtradas */}
            <div className="overflow-auto border p-3 rounded-md shadow-sm">
              <PersonTable
                persons={personasFiltradas}
                users={usuarios}
                onEdit={(user) => {
                  setEditingUser(user);
                  setAlert(null); // Limpiar alertas previas
                }}
                onDelete={handleDelete}
                onSeeDetails={handleSeeDetails}
              />
            </div>

            <PersonCreateDialog
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              newUser={newUser}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              tiposDocumentos={tiposDocumentos}
              localidades={localidades}
              handleChangePostal={handleChangePostal}
              redesSociales={redesSociales}
              usuarios={usuarios}
              error={error}
              loading={loading}
            />

            {alert && (
              <div className="fixed bottom-16 right-4 z-50 w-96">
                <Alert
                  variant={alert.variant || "default"}
                  className="animate-in slide-in-from-right-8 duration-300 bg-card border-black"
                >
                  <AlertTitle>{alert.title}</AlertTitle>
                  {alert.description && (
                    <AlertDescription>{alert.description}</AlertDescription>
                  )}
                  <button
                    onClick={() => setAlert(null)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breadcrumb navegación */}
        <PersonBreadcrumb />
      </Fade>

      {/* Diálogo modal para editar usuario */}
      {editingUser && (
        <PersonEditDialog
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          onSubmit={handleEditSubmit}
          tiposDocumentos={tiposDocumentos}
          usuarios={usuarios}
          error={error}
          loading={loading}
        />
      )}
    </div>
  );
}

export default AdminPersons;
