import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";

const API_URL = "http://localhost:5002/api/creus/api/certificaciones";
const PAGE_SIZE = 10;

const GestionCertificacion = () => {
  const [certificaciones, setCertificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCertificaciones, setFilteredCertificaciones] = useState([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [currentCertificacion, setCurrentCertificacion] = useState({
    id: null,
    nombre: "",
    observaciones: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Eliminar
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [certificacionToDelete, setCertificacionToDelete] = useState(null);

  // Mensajes
  const [message, setMessage] = useState(null);

  // Móvil
  const [mobilePage, setMobilePage] = useState(1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const observer = useRef();

  const mobileVisibleCertificaciones = filteredCertificaciones.slice(
    0,
    mobilePage * PAGE_SIZE,
  );

  const lastCardRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          mobileVisibleCertificaciones.length < filteredCertificaciones.length
        ) {
          setMobilePage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [mobileVisibleCertificaciones.length, filteredCertificaciones.length],
  );

  // Cargar certificaciones
  useEffect(() => {
    fetchCertificaciones();
  }, []);

  const fetchCertificaciones = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setCertificaciones(res.data.data || res.data);
      setError(null);
    } catch {
      setError("Error al cargar las certificaciones.");
    } finally {
      setLoading(false);
    }
  };

  // Normalizar para búsqueda
  const normalize = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCertificaciones(certificaciones);
    } else {
      const normalizedSearch = normalize(searchTerm);
      const filtered = certificaciones.filter(
        (cert) =>
          normalize(cert.nombre).includes(normalizedSearch) ||
          (cert.observaciones &&
            normalize(cert.observaciones).includes(normalizedSearch)),
      );
      setFilteredCertificaciones(filtered);
    }
  }, [certificaciones, searchTerm]);

  // Ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortCertificaciones = (items, config) => {
    if (!config.key) return items;
    return [...items].sort((a, b) => {
      const aValue = (a[config.key] || "").toLowerCase();
      const bValue = (b[config.key] || "").toLowerCase();
      if (aValue < bValue) return config.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return config.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedCertificaciones = sortCertificaciones(
    filteredCertificaciones,
    sortConfig,
  );

  // Modal crear/editar
  const openCreateModal = () => {
    setModalMode("crear");
    setCurrentCertificacion({ id: null, nombre: "", observaciones: "" });
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  const openEditModal = (cert) => {
    setModalMode("editar");
    setCurrentCertificacion(cert);
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  // Validaciónes
  const validateForm = () => {
    const errors = {};
    const nombreNormalizado = currentCertificacion.nombre.trim().toLowerCase();

    if (!nombreNormalizado) {
      errors.nombre = "El nombre es obligatorio";
    } else if (currentCertificacion.nombre.length > 255) {
      errors.nombre = "El nombre no puede superar los 255 caracteres";
    } else {
      // nombre repetido?
      const nombreRepetido = certificaciones.some(
        (cert) =>
          cert.nombre.trim().toLowerCase() === nombreNormalizado &&
          cert.id !== currentCertificacion.id,
      );
      if (nombreRepetido) {
        errors.nombre = "Ya existe una certificación con ese nombre";
      }
    }

    if (
      currentCertificacion.observaciones &&
      currentCertificacion.observaciones.length > 500
    ) {
      errors.observaciones =
        "Las observaciones no pueden superar los 500 caracteres";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar
  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      if (modalMode === "crear") {
        const res = await axios.post(API_URL, {
          nombre: currentCertificacion.nombre,
          observaciones: currentCertificacion.observaciones,
        });
        const nuevoId = res.data.data.id;
        const detalle = await axios.get(`${API_URL}/${nuevoId}`);
        setCertificaciones((prev) => [...prev, detalle.data.data]);
        setMessage("Certificación creada correctamente");
      } else {
        const res = await axios.put(`${API_URL}/${currentCertificacion.id}`, {
          nombre: currentCertificacion.nombre,
          observaciones: currentCertificacion.observaciones,
        });
        const actualizado = res.data.data;
        setCertificaciones((prev) =>
          prev.map((cert) =>
            cert.id === currentCertificacion.id ? actualizado : cert,
          ),
        );
        setMessage("Certificación actualizada correctamente");
      }
      setModalOpen(false);
      setValidationErrors({});
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error al guardar la certificación. Verifica los datos e intenta de nuevo.",
      );
    }
  };

  // Eliminar
  const confirmDelete = (cert) => {
    setCertificacionToDelete(cert);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${certificacionToDelete.id}`);
      setCertificaciones((prev) =>
        prev.filter((cert) => cert.id !== certificacionToDelete.id),
      );
      setDeleteConfirmOpen(false);
      setCertificacionToDelete(null);
      setMessage("Certificación eliminada correctamente");
    } catch {
      alert("Error al eliminar la certificación.");
    }
  };

  // Cerrar modales
  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
      setValidationErrors({});
    }
  };
  const handleDeleteBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setDeleteConfirmOpen(false);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => setSearchTerm("");

  // Mensaje de éxito/desaparece solo
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Iconos
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

  // Render
  return (
    <AdminLayout>
      <div className="p-6 h-full flex flex-col">
        {/* Título, botón y búsqueda */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between mb-2 gap-4">
            <div className="flex-1 w-full">
              <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left mb-1">
                Gestión de Títulos de Certificación
              </h1>
              <p className="text-gray-600 text-center sm:text-left">
                Administra los títulos de certificación del sistema
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:items-center gap-2">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon />
                Nueva Certificación
              </button>
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

        {/* Búsqueda */}
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
                  {filteredCertificaciones.length} resultado
                  {filteredCertificaciones.length !== 1 ? "s" : ""} encontrado
                  {filteredCertificaciones.length !== 1 ? "s" : ""} para "
                  {searchTerm}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tabla/cards */}
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Cargando certificaciones...</p>
            </div>
          ) : error ? (
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
                  onClick={fetchCertificaciones}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : filteredCertificaciones.length === 0 ? (
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
                      No se encontraron certificaciones que coincidan con "
                      {searchTerm}"
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
                      No hay certificaciones cargadas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Comienza creando tu primera certificación
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Crear primera certificación
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Tabla escritorio */}
              <div className="hidden lg:block h-full">
                <div className="bg-white border border-gray-300 rounded-lg shadow h-full flex flex-col">
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
                      {sortedCertificaciones.map((cert) => (
                        <div
                          key={cert.id}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="grid grid-cols-12 gap-4 items-start">
                            <div className="col-span-2">
                              <p className="font-medium text-gray-900">
                                {cert.id}
                              </p>
                            </div>
                            <div className="col-span-4">
                              <p className="font-medium text-gray-900">
                                {cert.nombre}
                              </p>
                            </div>
                            <div className="col-span-4">
                              <div className="text-gray-600 text-sm">
                                {cert.observaciones ? (
                                  <span
                                    className="block truncate max-w-xs text-gray-700 cursor-pointer hover:underline"
                                    title={cert.observaciones}
                                    onClick={() => {
                                      if (cert.observaciones.length > 60) {
                                        alert(cert.observaciones);
                                      }
                                    }}
                                  >
                                    {cert.observaciones.length > 60
                                      ? cert.observaciones.slice(0, 60) + "..."
                                      : cert.observaciones}
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
                                  onClick={() => openEditModal(cert)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  onClick={() => confirmDelete(cert)}
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

              {/* Cards móvil/tablet */}
              <div className="lg:hidden">
                <div>
                  <div className="space-y-4 pb-24">
                    {mobileVisibleCertificaciones.map((cert, idx) => {
                      const isLast =
                        idx === mobileVisibleCertificaciones.length - 1;
                      return (
                        <div
                          key={cert.id}
                          ref={isLast ? lastCardRef : undefined}
                          className="bg-white rounded-lg shadow border"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-gray-900 flex-1 pr-4">
                                {cert.nombre}
                              </h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openEditModal(cert)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  onClick={() => confirmDelete(cert)}
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
                              {cert.observaciones ? (
                                <span
                                  className="text-gray-700 text-sm block truncate cursor-pointer hover:underline"
                                  title={cert.observaciones}
                                  onClick={() => {
                                    if (cert.observaciones.length > 60) {
                                      alert(cert.observaciones);
                                    }
                                  }}
                                >
                                  {cert.observaciones.length > 60
                                    ? cert.observaciones.slice(0, 60) + "..."
                                    : cert.observaciones}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic text-sm">
                                  Sin observaciones
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {mobileVisibleCertificaciones.length >=
                      filteredCertificaciones.length && (
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

        {/* Modal crear/editar */}
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
                      ? "Nueva Certificación"
                      : "Editar Certificación"}
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
                      value={currentCertificacion.nombre}
                      onChange={(e) => {
                        setCurrentCertificacion({
                          ...currentCertificacion,
                          nombre: e.target.value,
                        });
                        if (validationErrors.nombre) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            nombre: "",
                          }));
                        }
                      }}
                      placeholder="Ingrese el nombre de la certificación"
                      maxLength={255}
                    />
                    {validationErrors.nombre && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.nombre}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 text-right">
                      {currentCertificacion.nombre.length}/255 caracteres
                    </p>
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
                      value={currentCertificacion.observaciones}
                      onChange={(e) => {
                        setCurrentCertificacion({
                          ...currentCertificacion,
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
                    <p className="mt-1 text-xs text-gray-500 text-right">
                      {(currentCertificacion.observaciones || "").length}/500
                      caracteres
                    </p>
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

        {/* Modal eliminar */}
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
                    ¿Estás seguro que querés eliminar la certificación:
                  </p>
                  <p className="font-semibold text-gray-900 mb-4">
                    "{certificacionToDelete?.nombre}"
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
      </div>
    </AdminLayout>
  );
};

export default GestionCertificacion;