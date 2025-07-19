import React, { useState, useEffect, useMemo } from "react";
import { Fade } from "react-awesome-reveal";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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
    showAlert,
    fetchLocalidadesPorCodigoPostal,
    handleDelete,
    handleEditSubmit: handleEditSubmitHook,
    setLocalidades,
  } = usePersonas();

  console.log("Personas obtenidas:", personas);
  const { usuarios, loading, error } = useUsuariosBasic();

  console.log("Usuarios obtenidos:", usuarios);

  // Efecto para cargar localidades cuando cambia el código postal
  useEffect(() => {
    if (newUser.codigo_postal?.length >= 4) {
      fetchLocalidadesPorCodigoPostal(newUser.codigo_postal);
    } else {
      setLocalidades([]);
    }
  }, [newUser.codigo_postal]);

  // Efecto para resetear la página actual cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [filtro]);

  // Filtra personas según texto en nombre, apellido o documento (insensible a mayúsculas)
  const personasFiltradas = useMemo(() => {
    return personas.filter((user) => {
      const textoMatch =
        `${user.nombre} ${user.apellido}`
          .toLowerCase()
          .includes(filtro.toLowerCase()) ||
        (user.nro_documento &&
          user.nro_documento.toLowerCase().includes(filtro.toLowerCase()));
      return textoMatch;
    });
  }, [personas, filtro]);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(personasFiltradas.length / itemsPerPage);

  // Obtener solo los items de la página actual usando useMemo para optimizar
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, personasFiltradas.length);
    return personasFiltradas.slice(startIndex, endIndex);
  }, [personasFiltradas, currentPage]);

  // Función para cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Función para ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Función para ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generar los números de página a mostrar
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      // Si hay 5 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      pages.push(1);

      // Si la página actual está lejos del inicio, mostrar elipsis
      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      // Mostrar páginas alrededor de la actual
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // Si la página actual está lejos del final, mostrar elipsis
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Siempre mostrar la última página
      pages.push(totalPages);
    }

    return pages;
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
          id: res?.data?.id,
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
        showAlert({
          title: "Éxito",
          description: "La persona se creó correctamente",
          variant: "success"
        });
      });
    } catch (error) {
      console.error("Error al crear persona:", error);

      try{
        for(let key in error?.data?.error){
          showAlert({
            title: "Error",
            description: error?.data?.error[key],
            variant: "destructive"
          });
        }
      }catch(err){
        showAlert({
          title: "Error",
          description: "Error al crear persona",
          variant: "destructive"
        });
      }
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
              {filtro && (
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  {personasFiltradas.length} resultado{personasFiltradas.length !== 1 ? 's' : ''} encontrado{personasFiltradas.length !== 1 ? 's' : ''}
                </span>
              )}
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
              {personasFiltradas.length > 0 ? (
                <PersonTable
                  persons={currentItems}
                  users={usuarios}
                  onEdit={(user) => {
                    setEditingUser(user);
                    showAlert(null); // Limpiar alertas previas
                  }}
                  onDelete={handleDelete}
                  onSeeDetails={handleSeeDetails}
                />
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No se encontraron personas que coincidan con la búsqueda.
                </p>
              )}
            </div>

            {/* Paginación mejorada */}
            {totalPages > 1 && (
              <CardFooter className="pt-6">
                <Pagination className="w-full">
                  <PaginationContent>
                    {/* Botón Anterior en español */}
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-9 px-4 flex items-center gap-1 ${
                          currentPage === 1
                            ? "opacity-50 pointer-events-none"
                            : "cursor-pointer"
                        }`}
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                    </PaginationItem>

                    {getPageNumbers().map((pageNum, index) => {
                      if (
                        pageNum === "ellipsis-start" ||
                        pageNum === "ellipsis-end"
                      ) {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={`page-${pageNum}`}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {/* Botón Siguiente en español */}
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-9 px-4 flex items-center gap-1 ${
                          currentPage === totalPages
                            ? "opacity-50 pointer-events-none"
                            : "cursor-pointer"
                        }`}
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            )}

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
                  {alert?.description && (
                    <AlertDescription>{alert.description}</AlertDescription>
                  )}
                  <button
                    onClick={() => showAlert(null)}
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