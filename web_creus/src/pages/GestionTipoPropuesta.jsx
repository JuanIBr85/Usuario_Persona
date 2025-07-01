import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";

const API_URL = "http://localhost:5002/api/creus/api/tipos-propuesta";
const PAGE_SIZE = 10; //para la vista de movil

const GestionTipoPropuesta = () => {
  // estados principales, carga, error, etc
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ESTADOS BUSQUEDAS
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTipos, setFilteredTipos] = useState([]);

  // para modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [currentTipo, setCurrentTipo] = useState({
    id: null,
    nombre: "",
    observaciones: "",
  });

  // confirmar eliminado
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tipoToDelete, setTipoToDelete] = useState(null);

  // para mensajes de éxito y validación
  const [message, setMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // para movil
  const [mobilePage, setMobilePage] = useState(1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const observer = useRef();

  // ""cards""" para movil
  const mobileVisibleTipos = filteredTipos.slice(0, mobilePage * PAGE_SIZE);

  // arreglo del scroll para movil (o bueno, tablet)
  const lastCardRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          mobileVisibleTipos.length < filteredTipos.length
        ) {
          setMobilePage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [mobileVisibleTipos.length, filteredTipos.length],
  );

  // cargar tipos de propuesta al inicio
  useEffect(() => {
    fetchTipos();
  }, []);

  // para quitar tildes (para las busqueads)
  const normalize = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // busqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTipos(tipos);
    } else {
      const normalizedSearch = normalize(searchTerm);
      const filtered = tipos.filter(
        (tipo) =>
          normalize(tipo.nombre).includes(normalizedSearch) ||
          (tipo.observaciones &&
            normalize(tipo.observaciones).includes(normalizedSearch)),
      );
      setFilteredTipos(filtered);
    }
  }, [tipos, searchTerm]);

  // obtener tipos de propuesta
  const fetchTipos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setTipos(res.data.data || res.data);
      setError(null);
    } catch {
      setError("Error al cargar los tipos de propuesta.");
    } finally {
      setLoading(false);
    }
  };

  // abrir modal para nuevo tipo
  const openCreateModal = () => {
    setModalMode("crear");
    setCurrentTipo({ id: null, nombre: "", observaciones: "" });
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  // abrir modal para edtiar
  const openEditModal = (tipo) => {
    setModalMode("editar");
    setCurrentTipo(tipo);
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  //validaciones
  const validateForm = () => {
    const errors = {};
    const nombreNormalizado = currentTipo.nombre.trim().toLowerCase();

    if (!nombreNormalizado) {
      errors.nombre = "El nombre es obligatorio";
    } else if (currentTipo.nombre.length > 255) {
      errors.nombre = "El nombre no puede superar los 255 caracteres";
    } else {
      const nombreRepetido = tipos.some(
        (tipo) =>
          tipo.nombre.trim().toLowerCase() === nombreNormalizado &&
          tipo.id !== currentTipo.id,
      );
      if (nombreRepetido) {
        errors.nombre = "Ya existe un tipo de propuesta con ese nombre";
      }
    }

    if (currentTipo.observaciones && currentTipo.observaciones.length > 500) {
      errors.observaciones =
        "Las observaciones no pueden superar los 500 caracteres";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // guardar
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      if (modalMode === "crear") {
        const res = await axios.post(API_URL, {
          nombre: currentTipo.nombre,
          observaciones: currentTipo.observaciones,
        });
        const nuevoId = res.data.data.id;
        const detalle = await axios.get(`${API_URL}/${nuevoId}`);
        setTipos((prev) => [...prev, detalle.data.data]);
        setMessage("Tipo de propuesta creado correctamente");
      } else {
        const res = await axios.put(`${API_URL}/${currentTipo.id}`, {
          nombre: currentTipo.nombre,
          observaciones: currentTipo.observaciones,
        });
        const actualizado = res.data.data;
        setTipos((prev) =>
          prev.map((tipo) => (tipo.id === currentTipo.id ? actualizado : tipo)),
        );
        setMessage("Tipo de propuesta actualizado correctamente");
      }
      setModalOpen(false);
      setValidationErrors({});
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error al guardar el tipo de propuesta. Verifica los datos e intenta de nuevo.",
      );
    }
  };

  // confirmar eliminar (se abre el moddal)
  const confirmDelete = (tipo) => {
    setTipoToDelete(tipo);
    setDeleteConfirmOpen(true);
  };

  // eliminar tipo de propuesta
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${tipoToDelete.id}`);
      setTipos((prev) => prev.filter((tipo) => tipo.id !== tipoToDelete.id));
      setDeleteConfirmOpen(false);
      setTipoToDelete(null);
      setMessage("Tipo de propuesta eliminado correctamente");
    } catch {
      alert("Error al eliminar el tipo de propuesta.");
    }
  };

  // se cerrar el modal cuando se clikea afuera
  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
      setValidationErrors({});
    }
  };

  // se cierra el de eliminar cuando se aprieta afuera
  const handleDeleteBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setDeleteConfirmOpen(false);
    }
  };

  // para limpiar la busqueda
  const clearSearch = () => {
    setSearchTerm("");
  };

  // estado para el ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // funcion para ordenamiento
  const sortTipos = (tipos, config) => {
    if (!config.key) return tipos;
    return [...tipos].sort((a, b) => {
      const aValue = (a[config.key] || "").toLowerCase();
      const bValue = (b[config.key] || "").toLowerCase();
      if (aValue < bValue) return config.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return config.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  // para cambiar el orden de la columna
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // ordenamientos
  const sortedTipos = sortTipos(filteredTipos, sortConfig);

  // iconos
  const EditIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
  const DeleteIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
  const PlusIcon = () => (
    <svg
      className="w-5 h-5 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  );
  const SearchIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
  const ClearIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  // para que desaparezca automaticamente los mesnajes de exito
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // pagina principal
  return (
    <AdminLayout>
      <div className="p-6 h-full flex flex-col">
        {/*tituluo, subtitulo, boton para crear y la barra de busqueda*/}
        <div className="flex-shrink-0 mb-6">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between mb-2 gap-4">
            <div className="flex-1 w-full">
              <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left mb-1">
                Gestor de Tipos de Propuesta
              </h1>
              <p className="text-gray-600 text-center sm:text-left">
                Administra los tipos de propuestas del sistema
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:items-center gap-2">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon />
                Nuevo tipo
              </button>
              {/* Icono de búsqueda solo en móvil */}
              <button
                type="button"
                className="sm:hidden ml-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => setShowMobileSearch((v) => !v)}
                aria-label="Buscar"
              >
                <SearchIcon />
              </button>
            </div>
          </div>
          {/* Mensaje de "exito", para cuando algo se crea, se limina o se edita */}
          {message && (
            <div className="mb-4">
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {message}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* buscar */}
        {(showMobileSearch || window.innerWidth >= 640) && (
          <div
            className={`mb-4 mt-0 sm:mt-0 transition-all duration-200 ${showMobileSearch ? "" : "sm:block hidden"}`}
          >
            <div className="w-full sm:w-full lg:w-full xl:w-full 2xl:w-full px-0 sm:px-0">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-600">
                  {filteredTipos.length} resultado
                  {filteredTipos.length !== 1 ? "s" : ""} encontrado
                  {filteredTipos.length !== 1 ? "s" : ""} para "{searchTerm}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* tabla con todo el contenido(o cards, para movil o tablet) dependiendo */}
        <div className="flex-1 min-h-0">
          {/* cargar */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Cargando tipos...</p>
            </div>
          ) : error ? (
            // error-
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                <svg
                  className="w-12 h-12 text-red-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={fetchTipos}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : filteredTipos.length === 0 ? (
            // sin resultados
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-md text-center">
                {searchTerm ? (
                  <>
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sin resultados
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No se encontraron tipos que coincidan con "{searchTerm}"
                    </p>
                    <button
                      onClick={clearSearch}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Limpiar búsqueda
                    </button>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay tipos cargados
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Comienza creando tu primer tipo de propuesta
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Crear primer tipo
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* tabla (para pc)) */}
              <div className="hidden lg:block h-full">
                <div className="bg-white border border-gray-300 rounded-lg shadow h-full flex flex-col w-full">
                  <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div className="px-6 py-3">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-2 flex items-center h-full">
                          <button
                            type="button"
                            className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                            onClick={() => handleSort("id")}
                          >
                            ID
                            {sortConfig.key === "id" &&
                              (sortConfig.direction === "asc" ? (
                                <span>&uarr;</span>
                              ) : (
                                <span>&darr;</span>
                              ))}
                          </button>
                        </div>
                        <div className="col-span-4 flex items-center h-full">
                          <button
                            type="button"
                            className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                            onClick={() => handleSort("nombre")}
                          >
                            Nombre
                            {sortConfig.key === "nombre" &&
                              (sortConfig.direction === "asc" ? (
                                <span>&uarr;</span>
                              ) : (
                                <span>&darr;</span>
                              ))}
                          </button>
                        </div>
                        <div className="col-span-4 flex items-center h-full">
                          <button
                            type="button"
                            className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                            onClick={() => handleSort("observaciones")}
                          >
                            Observaciones
                            {sortConfig.key === "observaciones" &&
                              (sortConfig.direction === "asc" ? (
                                <span>&uarr;</span>
                              ) : (
                                <span>&darr;</span>
                              ))}
                          </button>
                        </div>
                        <div className="col-span-2 flex items-center justify-center h-full">
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Acciones
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-gray-200">
                      {sortedTipos.map((tipo) => (
                        <div
                          key={tipo.id}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="grid grid-cols-12 gap-4 items-start">
                            <div className="col-span-2">
                              <p className="font-medium text-gray-900">
                                {tipo.id}
                              </p>
                            </div>
                            <div className="col-span-4">
                              <p className="font-medium text-gray-900">
                                {tipo.nombre}
                              </p>
                            </div>
                            <div className="col-span-4">
                              <div className="text-gray-600 text-sm">
                                {tipo.observaciones ? (
                                  <span
                                    className="block truncate max-w-xs text-gray-700"
                                    title={tipo.observaciones}
                                  >
                                    {tipo.observaciones}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    Sin observaciones
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="col-span-2">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => openEditModal(tipo)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  onClick={() => confirmDelete(tipo)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                                  title="Eliminar"
                                >
                                  <DeleteIcon />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* las cards para tablet y celularr */}
              <div className="lg:hidden h-full">
                <div className="h-full overflow-y-auto">
                  <div className="space-y-4 pb-24">
                    {mobileVisibleTipos.map((tipo, idx) => {
                      const isLast = idx === mobileVisibleTipos.length - 1;
                      return (
                        <div
                          key={tipo.id}
                          ref={isLast ? lastCardRef : undefined}
                          className="bg-white rounded-lg shadow border"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-gray-900 flex-1 pr-4">
                                {tipo.nombre}
                              </h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openEditModal(tipo)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  onClick={() => confirmDelete(tipo)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                                  title="Eliminar"
                                >
                                  <DeleteIcon />
                                </button>
                              </div>
                            </div>
                            <div className="border-t pt-3">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                Observaciones
                              </p>
                              {tipo.observaciones ? (
                                <p
                                  className="text-gray-700 text-sm truncate"
                                  title={tipo.observaciones}
                                >
                                  {tipo.observaciones}
                                </p>
                              ) : (
                                <p className="text-gray-400 italic text-sm">
                                  Sin observaciones
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/*fin de la lista */}
                    {mobileVisibleTipos.length >= filteredTipos.length && (
                      <div className="text-center text-gray-400 text-xs pb-4">
                        Fin de la lista
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* modal para crear o editar . */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === "crear"
                    ? "Nuevo Tipo de Propuesta"
                    : "Editar Tipo de Propuesta"}
                </h2>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setValidationErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      validationErrors.nombre
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    value={currentTipo.nombre}
                    onChange={(e) => {
                      setCurrentTipo({
                        ...currentTipo,
                        nombre: e.target.value,
                      });
                      if (validationErrors.nombre) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          nombre: "",
                        }));
                      }
                    }}
                    placeholder="Ingrese el nombre del tipo"
                    maxLength={255}
                  />
                  {validationErrors.nombre && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    rows={4}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none ${
                      validationErrors.observaciones
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    value={currentTipo.observaciones}
                    onChange={(e) => {
                      setCurrentTipo({
                        ...currentTipo,
                        observaciones: e.target.value,
                      });
                      if (validationErrors.observaciones) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          observaciones: "",
                        }));
                      }
                    }}
                    placeholder="Observaciones adicionales (opcional)"
                    maxLength={500}
                  />
                  {validationErrors.observaciones && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.observaciones}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setValidationErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {modalMode === "crear" ? "Crear" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal eliminacion de tipo (la confirmacion) --- */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleDeleteBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirmar eliminación
                </h3>
                <p className="text-gray-600 mb-2">
                  ¿Estás seguro que querés eliminar el tipo:
                </p>
                <p className="font-semibold text-gray-900 mb-4">
                  "{tipoToDelete?.nombre}"
                </p>
                <p className="text-sm text-red-600 mb-6">
                  Esta acción no se puede deshacer
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default GestionTipoPropuesta;
