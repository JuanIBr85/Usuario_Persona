import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { Eye } from "lucide-react";

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

const API_URL = "http://localhost:5002/api/creus/api/sede-creus";
const ESTADO_API_URL = "http://localhost:5002/api/creus/api/estados";
const PAGE_SIZE = 10;

const initialSede = {
  id: null,
  nombre: "",
  email: "",
  telefono: "",
  pagina_web: "",
  calle: "",
  numero: "",
  ciudad: "",
  provincia: "",
  pais: "",
  codigo_postal: "",
  id_estado: 1,
  observaciones: "",
};

const GestionSedeCreus = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estados, setEstados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSedes, setFilteredSedes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [currentSede, setCurrentSede] = useState(initialSede);
  const [detalleSede, setDetalleSede] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sedeToDelete, setSedeToDelete] = useState(null);
  const [message, setMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [mobilePage, setMobilePage] = useState(1);
  const observer = useRef();
  const mobileVisibleSedes = filteredSedes.slice(0, mobilePage * PAGE_SIZE);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Normalizar texto para búsqueda
  const normalize = (str) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  useEffect(() => {
    fetchSedes();
    fetchEstados();
  }, []);

  const fetchSedes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setSedes(Array.isArray(res.data.data) ? res.data.data : []);
      setError(null);
    } catch {
      setError("Error al cargar las sedes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEstados = async () => {
    try {
      const res = await axios.get(ESTADO_API_URL);
      // Asegura que siempre sea un array
      if (Array.isArray(res.data)) {
        setEstados(res.data);
      } else if (Array.isArray(res.data.data)) {
        setEstados(res.data.data);
      } else if (Array.isArray(res.data.message)) {
        setEstados(res.data.message);
      } else {
        setEstados([]);
      }
    } catch {
      setEstados([]);
    }
  };

  useEffect(() => {
    let lista = Array.isArray(sedes) ? sedes : [];
    if (searchTerm.trim()) {
      const normalizedSearch = normalize(searchTerm);
      lista = lista.filter(
        (s) =>
          normalize(s.nombre).includes(normalizedSearch) ||
          normalize(s.ciudad).includes(normalizedSearch) ||
          normalize(s.provincia).includes(normalizedSearch) ||
          normalize(s.pais).includes(normalizedSearch) ||
          normalize(s.email || "").includes(normalizedSearch) ||
          normalize(s.telefono || "").includes(normalizedSearch) ||
          normalize(s.observaciones || "").includes(normalizedSearch) ||
          // Búsqueda por dirección (calle + número)
          normalize(`${s.calle || ""} ${s.numero || ""}`).includes(
            normalizedSearch,
          ) ||
          normalize(s.pagina_web || "").includes(normalizedSearch),
      );
    }
    setFilteredSedes(lista);
  }, [sedes, searchTerm, estados]);

  // Ordenamiento
  const sortSedes = (sedes, config) => {
    if (!config.key) return sedes;
    return [...sedes].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];

      // Ordenar por número
      if (["id"].includes(config.key)) {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      // Ordenar por string (default)
      else {
        aValue = (aValue || "").toString().toLowerCase();
        bValue = (bValue || "").toString().toLowerCase();
      }

      if (aValue < bValue) return config.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return config.direction === "asc" ? 1 : -1;
      return 0;
    });
  };
  const sortedSedes = sortSedes(filteredSedes, sortConfig);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Scroll infinito para móvil/tablet
  const lastCardRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          mobileVisibleSedes.length < filteredSedes.length
        ) {
          setMobilePage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [mobileVisibleSedes.length, filteredSedes.length],
  );

  // Modal crear/editar
  const openCreateModal = () => {
    setModalMode("crear");
    setCurrentSede(initialSede);
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  const openEditModal = (sede) => {
    setModalMode("editar");
    setCurrentSede({ ...sede });
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  // Modal eliminar
  const openDeleteModal = (sede) => {
    setSedeToDelete(sede);
    setDeleteConfirmOpen(true);
  };

  // Validación de formulario
  const validateForm = () => {
    const errors = {};
    if (!currentSede.nombre || currentSede.nombre.trim().length < 1)
      errors.nombre = "El nombre es obligatorio";
    if (!currentSede.calle) errors.calle = "La calle es obligatoria";
    if (!currentSede.numero) errors.numero = "El número es obligatorio";
    if (!currentSede.ciudad) errors.ciudad = "La ciudad es obligatoria";
    if (!currentSede.provincia)
      errors.provincia = "La provincia es obligatoria";
    if (!currentSede.pais) errors.pais = "El país es obligatorio";
    if (!currentSede.id_estado) errors.id_estado = "El estado es obligatorio";

    // Validación de email (si se ingresa)
    if (currentSede.email && currentSede.email.trim()) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(currentSede.email.trim())) {
        errors.email = "El email no tiene un formato válido";
      }
    }

    // Validación de sitio web (si se ingresa)
    if (currentSede.pagina_web && currentSede.pagina_web.trim()) {
      // Permite http(s):// o solo dominio
      const webRegex =
        /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
      if (!webRegex.test(currentSede.pagina_web.trim())) {
        errors.pagina_web = "El sitio web no tiene un formato válido";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar sede
  const handleSave = async () => {
    if (!validateForm()) return;
    const { id, ...rest } = currentSede;
    const data = { ...rest };

    try {
      if (modalMode === "crear") {
        await axios.post(API_URL, data);
        await fetchSedes();
        setMessage("Sede creada correctamente");
      } else {
        await axios.put(`${API_URL}/${id}`, data);
        await fetchSedes();
        setMessage("Sede actualizada correctamente");
      }
      setModalOpen(false);
      setValidationErrors({});
    } catch (err) {
      if (err.response?.data) {
        const errores =
          err.response.data.errors ||
          err.response.data.message ||
          err.response.data.messages;
        if (typeof errores === "object" && errores !== null) {
          setValidationErrors(errores);
        } else {
          alert(
            errores ||
            "Error al guardar la sede. Verifica los datos e intenta de nuevo.",
          );
        }
      } else {
        alert(
          "Error al guardar la sede. Verifica los datos e intenta de nuevo.",
        );
      }
    }
  };

  // Eliminar sede
  const eliminarSede = async () => {
    if (!sedeToDelete) return;
    try {
      await axios.delete(`${API_URL}/${sedeToDelete.id}`);
      setSedes((prev) => prev.filter((s) => s.id !== sedeToDelete.id));
      setMessage("Sede eliminada correctamente");
      setDeleteConfirmOpen(false);
      setSedeToDelete(null);
    } catch (err) {
      alert("Error al eliminar la sede.");
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => setSearchTerm("");

  // Mensaje de éxito autodesaparece
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Modal backdrop click para cerrar
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

  return (
    <AdminLayout>
      <div className="p-6 h-full flex flex-col">
        {/* Título, botón y búsqueda */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between mb-2 gap-4">
            <div className="flex-1 w-full">
              <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left mb-1">
                Gestor de Sedes CREUS
              </h1>
              <p className="text-gray-600 text-center sm:text-left">
                Administra las sedes del sistema
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:items-center gap-2">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon />
                Nueva sede
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

        {/* Barra de búsqueda */}
        <div className="mb-4">
          <div className="relative w-full">
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              {filteredSedes.length} resultado
              {filteredSedes.length !== 1 ? "s" : ""} encontrado
              {filteredSedes.length !== 1 ? "s" : ""} para "{searchTerm}"
            </p>
          )}
        </div>

        {/* Tabla escritorio y cards mobile/tablet con loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando sedes...</p>
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
                onClick={fetchSedes}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : filteredSedes.length === 0 ? (
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
                    No se encontraron sedes que coincidan con "{searchTerm}"
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
                    No hay sedes cargadas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza creando tu primera sede
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Crear primera sede
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Tabla escritorio */}
            <div className="hidden lg:flex flex-1 min-h-0 w-full overflow-x-auto">
              <div className="bg-white border border-gray-300 rounded-lg shadow h-full flex flex-col w-full">
                <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div className="px-6 py-3">
                    <div className="grid grid-cols-12 gap-4 w-full">
                      <div className="col-span-2 flex items-center h-full">
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
                      <div className="col-span-2 flex items-center h-full">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort("ciudad")}
                        >
                          Ciudad
                          {sortConfig.key === "ciudad" &&
                            (sortConfig.direction === "asc" ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            ))}
                        </button>
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort("provincia")}
                        >
                          Provincia
                          {sortConfig.key === "provincia" &&
                            (sortConfig.direction === "asc" ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            ))}
                        </button>
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          País
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Estado
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center h-full">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scroll-container">
                  <div className="divide-y divide-gray-200 pb-4">
                    {sortedSedes.map((s) => (
                      <div
                        key={s.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-2">
                            <p className="font-medium text-gray-900">
                              {s.nombre}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">{s.ciudad}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">{s.provincia}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">{s.pais}</p>
                          </div>
                          <div className="col-span-2">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${(() => {
                                const estado = estados.find(
                                  (est) => est.id === s.id_estado,
                                );
                                if (!estado) return "bg-gray-200 text-gray-700";
                                if (estado.nombre.toLowerCase() === "pendiente")
                                  return "bg-yellow-100 text-yellow-800";
                                if (
                                  estado.nombre.toLowerCase() === "finalizado"
                                )
                                  return "bg-blue-100 text-blue-800";
                                if (estado.activo)
                                  return "bg-green-100 text-green-800";
                                return "bg-gray-200 text-gray-700";
                              })()}`}
                            >
                              {(() => {
                                const estado = estados.find(
                                  (est) => est.id === s.id_estado,
                                );
                                return estado ? estado.nombre : "Sin estado";
                              })()}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => setDetalleSede(s)}
                                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(s)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Editar"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => openDeleteModal(s)}
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
            {/* Cards mobile/tablet */}
            <div className="block lg:hidden flex-1 min-h-0 overflow-y-auto">
              <div className="space-y-4">
                {mobileVisibleSedes.map((s, idx) => {
                  const isLast = idx === mobileVisibleSedes.length - 1;
                  const estado = estados.find((est) => est.id === s.id_estado);
                  return (
                    <div
                      key={s.id}
                      ref={isLast ? lastCardRef : undefined}
                      className="bg-white rounded-lg shadow border px-4 py-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {s.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.ciudad}, {s.provincia}, {s.pais}
                          </p>
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${(() => {
                            if (!estado) return "bg-gray-200 text-gray-700";
                            if (estado.nombre.toLowerCase() === "pendiente")
                              return "bg-yellow-100 text-yellow-800";
                            if (estado.nombre.toLowerCase() === "finalizado")
                              return "bg-blue-100 text-blue-800";
                            if (estado.activo)
                              return "bg-green-100 text-green-800";
                            return "bg-gray-200 text-gray-700";
                          })()}`}
                        >
                          {estado ? estado.nombre : "Sin estado"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                        <span>
                          <b>Email:</b> {s.email || "-"}
                        </span>
                        <span>
                          <b>Tel:</b> {s.telefono || "-"}
                        </span>
                        <span>
                          <b>Web:</b> {s.pagina_web || "-"}
                        </span>
                        <span>
                          <b>Obs:</b> {s.observaciones || "-"}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setDetalleSede(s)}
                          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => openDeleteModal(s)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Infinite scroll loader */}
                {loading && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                )}
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
                  {modalMode === "crear" ? "Nueva Sede" : "Editar Sede"}
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
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.nombre
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentSede.nombre}
                    onChange={(e) =>
                      setCurrentSede({ ...currentSede, nombre: e.target.value })
                    }
                    placeholder="Nombre de la sede"
                  />
                  {validationErrors.nombre && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.nombre}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Calle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.calle
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentSede.calle}
                      onChange={(e) =>
                        setCurrentSede({
                          ...currentSede,
                          calle: e.target.value,
                        })
                      }
                      placeholder="Calle"
                    />
                    {validationErrors.calle && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.calle}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Número <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.numero
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentSede.numero}
                      onChange={(e) =>
                        setCurrentSede({
                          ...currentSede,
                          numero: e.target.value,
                        })
                      }
                      placeholder="Número"
                    />
                    {validationErrors.numero && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.numero}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.ciudad
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentSede.ciudad}
                      onChange={(e) =>
                        setCurrentSede({
                          ...currentSede,
                          ciudad: e.target.value,
                        })
                      }
                      placeholder="Ciudad"
                    />
                    {validationErrors.ciudad && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.ciudad}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Provincia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.provincia
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentSede.provincia}
                      onChange={(e) =>
                        setCurrentSede({
                          ...currentSede,
                          provincia: e.target.value,
                        })
                      }
                      placeholder="Provincia"
                    />
                    {validationErrors.provincia && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.provincia}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      País <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.pais
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentSede.pais}
                      onChange={(e) =>
                        setCurrentSede({ ...currentSede, pais: e.target.value })
                      }
                      placeholder="País"
                    />
                    {validationErrors.pais && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.pais}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                      value={currentSede.codigo_postal || ""}
                      onChange={(e) =>
                        setCurrentSede({
                          ...currentSede,
                          codigo_postal: e.target.value,
                        })
                      }
                      placeholder="Código Postal"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.email
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentSede.email || ""}
                      onChange={(e) =>
                        setCurrentSede({
                          ...currentSede,
                          email: e.target.value,
                        })
                      }
                      placeholder="Email"
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                      value={currentSede.telefono || ""}
                      onChange={(e) =>
                        setCurrentSede({
                          ...currentSede,
                          telefono: e.target.value,
                        })
                      }
                      placeholder="Teléfono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Página Web
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.pagina_web
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentSede.pagina_web || ""}
                    onChange={(e) =>
                      setCurrentSede({
                        ...currentSede,
                        pagina_web: e.target.value,
                      })
                    }
                    placeholder="Página Web"
                  />
                  {validationErrors.pagina_web && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.pagina_web}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500 resize-none"
                    value={currentSede.observaciones || ""}
                    onChange={(e) =>
                      setCurrentSede({
                        ...currentSede,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Observaciones adicionales (opcional)"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {(currentSede.observaciones || "").length}/500 caracteres
                  </p>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    name="id_estado"
                    value={currentSede.id_estado}
                    onChange={(e) =>
                      setCurrentSede({
                        ...currentSede,
                        id_estado: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Seleccionar estado
                    </option>
                    {Array.isArray(estados) &&
                      estados.map((estado) => (
                        <option key={estado.id} value={estado.id}>
                          {estado.nombre}
                        </option>
                      ))}
                  </select>
                  {validationErrors.id_estado && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.id_estado}
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
      {/* Modal detalle */}
      {detalleSede && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              window.getSelection().isCollapsed
            ) {
              setDetalleSede(null);
            }
          }}
          style={{ userSelect: "auto" }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalle de Sede
                </h2>
                <button
                  onClick={() => setDetalleSede(null)}
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
              <div className="space-y-2 text-sm">
                <div>
                  <b>Nombre:</b> {detalleSede.nombre}
                </div>

                <div>
                  <b>Dirección:</b>{" "}
                  {[
                    `${detalleSede.calle} ${detalleSede.numero}`,
                    detalleSede.codigo_postal
                      ? `${detalleSede.ciudad} (CP ${detalleSede.codigo_postal})`
                      : detalleSede.ciudad,
                    detalleSede.provincia,
                    detalleSede.pais,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>

                <div>
                  <b>Email:</b> {detalleSede.email || "-"}
                </div>
                <div>
                  <b>Teléfono:</b> {detalleSede.telefono || "-"}
                </div>

                <div>
                  <b>Página Web:</b>{" "}
                  {detalleSede.pagina_web ? (
                    <a
                      href={
                        /^https?:\/\//i.test(detalleSede.pagina_web)
                          ? detalleSede.pagina_web
                          : `https://${detalleSede.pagina_web}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {detalleSede.pagina_web}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>

                <div>
                  <b>Estado:</b>{" "}
                  {(() => {
                    const estado = estados.find(
                      (e) => e.id === detalleSede.id_estado,
                    );
                    return estado ? estado.nombre : "Sin estado";
                  })()}
                </div>

                <div>
                  <b>Observaciones:</b> {detalleSede.observaciones || "-"}
                </div>
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
                  ¿Estás seguro que querés eliminar la sede:
                </p>
                <p className="font-semibold text-gray-900 mb-4">
                  {sedeToDelete?.nombre}
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
                    onClick={eliminarSede}
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

export default GestionSedeCreus;