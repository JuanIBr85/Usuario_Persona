import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { Eye } from "lucide-react";

const API_URL = "http://localhost:5002/api/creus/api/convenio";
const INSTITUCIONES_URL = "http://localhost:5002/api/creus/api/institucion";
const ESTADO_API_URL = "http://localhost:5002/api/creus/api/estados";
const ARCHIVOS_URL = "http://localhost:5002/api/creus/api/archivos";
const PAGE_SIZE = 10;

const initialConvenio = {
  id: null,
  nombre: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  id_archivo: "",
  id_institucion: "",
  id_estado: 1,
  observaciones: "",
};

function formatDateInput(dateStr) {
  if (!dateStr) return "";
  return dateStr.slice(0, 10);
}

//fecha formateada
const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const GestionConvenio = () => {
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [instituciones, setInstituciones] = useState([]);
  const [estados, setEstados] = useState([]);
  const [archivos, setArchivos] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConvenios, setFilteredConvenios] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [currentConvenio, setCurrentConvenio] = useState(initialConvenio);

  const [detalleConvenio, setDetalleConvenio] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [convenioToDelete, setConvenioToDelete] = useState(null);

  const [message, setMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [mobilePage, setMobilePage] = useState(1);
  const observer = useRef();
  const mobileVisibleConvenios = filteredConvenios.slice(
    0,
    mobilePage * PAGE_SIZE,
  );

  // Cargar datos
  useEffect(() => {
    fetchConvenios();
    fetchInstituciones();
    fetchEstados();
    fetchArchivos();
  }, []);

  const fetchConvenios = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setConvenios(res.data.data || []);
      setError(null);
    } catch {
      setError("Error al cargar los convenios.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstituciones = async () => {
    try {
      const res = await axios.get(INSTITUCIONES_URL);
      setInstituciones(res.data.data || []);
    } catch {
      setInstituciones([]);
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

  const fetchArchivos = async () => {
    try {
      const res = await axios.get(ARCHIVOS_URL);
      if (res.data.status === "success") {
        const archivosData = res.data.data || res.data.message || [];
        setArchivos(archivosData);
      } else {
        setArchivos([]);
      }
    } catch (error) {
      setArchivos([]);
    }
  };

  // Filtrado por búsqueda
  const normalize = (str) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConvenios(convenios);
    } else {
      const normalizedSearch = normalize(searchTerm);
      setFilteredConvenios(
        convenios.filter((c) => {
          const instNombre = getInstitucionNombre(
            c.id_institucion,
            instituciones,
          ).toLowerCase();
          const estadoNombre = getEstadoNombre(
            c.id_estado,
            estados,
          ).toLowerCase();
          const archivoNombre =
            archivos.find((a) => a.id === c.id_archivo)?.nombre || "";
          const archivoUrl =
            archivos.find((a) => a.id === c.id_archivo)?.url_archivo || "";
          const fechaInicio = formatDateForDisplay(c.fecha_inicio);
          const fechaFin = formatDateForDisplay(c.fecha_fin);
          return (
            normalize(c.nombre).includes(normalizedSearch) ||
            normalize(c.descripcion).includes(normalizedSearch) ||
            normalize(c.observaciones).includes(normalizedSearch) ||
            normalize(instNombre).includes(normalizedSearch) ||
            normalize(estadoNombre).includes(normalizedSearch) ||
            normalize(archivoNombre).includes(normalizedSearch) ||
            normalize(fechaInicio).includes(normalizedSearch) ||
            normalize(fechaFin).includes(normalizedSearch)
          );
        }),
      );
    }
  }, [convenios, searchTerm, instituciones, estados, archivos]);

  // Ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  // para obtener nombre de institución y estado y poderla ordenar
  const getInstitucionNombre = (id, instituciones) => {
    const inst = instituciones.find((i) => i.id === id);
    return inst ? inst.nombre : "";
  };
  const getEstadoNombre = (id, estados) => {
    const est = estados.find((e) => e.id === id);
    return est ? est.nombre : "";
  };

  const sortConvenios = (convenios, config) => {
    if (!config.key) return convenios;
    return [...convenios].sort((a, b) => {
      let aValue, bValue;
      if (config.key === "institucion") {
        aValue = getInstitucionNombre(
          a.id_institucion,
          instituciones,
        ).toLowerCase();
        bValue = getInstitucionNombre(
          b.id_institucion,
          instituciones,
        ).toLowerCase();
      } else if (config.key === "estado") {
        aValue = getEstadoNombre(a.id_estado, estados).toLowerCase();
        bValue = getEstadoNombre(b.id_estado, estados).toLowerCase();
      } else if (config.key === "fecha_inicio" || config.key === "fecha_fin") {
        aValue = a[config.key] ? new Date(a[config.key]) : new Date(0);
        bValue = b[config.key] ? new Date(b[config.key]) : new Date(0);
      } else {
        aValue = (a[config.key] || "").toString().toLowerCase();
        bValue = (b[config.key] || "").toString().toLowerCase();
      }
      if (aValue < bValue) return config.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return config.direction === "asc" ? 1 : -1;
      return 0;
    });
  };
  const sortedConvenios = sortConvenios(filteredConvenios, sortConfig);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Scroll para móvil/tablet
  const lastCardRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          mobileVisibleConvenios.length < filteredConvenios.length
        ) {
          setMobilePage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [mobileVisibleConvenios.length, filteredConvenios.length],
  );

  // Modal crear/editar
  const openCreateModal = () => {
    setModalMode("crear");
    setCurrentConvenio(initialConvenio);
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  const openEditModal = (convenio) => {
    setModalMode("editar");
    setCurrentConvenio({
      ...convenio,
      fecha_inicio: formatDateInput(convenio.fecha_inicio),
      fecha_fin: formatDateInput(convenio.fecha_fin),
      id_archivo: convenio.id_archivo || "",
      id_institucion: convenio.id_institucion || "",
      id_estado: convenio.id_estado || 1,
    });
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  // Modal eliminar
  const openDeleteModal = (convenio) => {
    setConvenioToDelete(convenio);
    setDeleteConfirmOpen(true);
  };

  // Validaciones de formulario
  const validateForm = () => {
    const errors = {};
    const nombreTrim = currentConvenio.nombre.trim();
    const descripcionTrim = currentConvenio.descripcion
      ? currentConvenio.descripcion.trim()
      : "";
    const observacionesTrim = currentConvenio.observaciones
      ? currentConvenio.observaciones.trim()
      : "";

    // Nombre: requerido, único, máximo 255
    if (!nombreTrim) {
      errors.nombre = "El nombre es obligatorio";
    } else if (nombreTrim.length > 255) {
      errors.nombre = "El nombre no puede superar los 255 caracteres";
    } else if (
      convenios.some(
        (c) =>
          c.nombre.trim().toLowerCase() === nombreTrim.toLowerCase() &&
          c.id !== currentConvenio.id,
      )
    ) {
      errors.nombre = "Ya existe un convenio con ese nombre";
    }

    if (descripcionTrim && descripcionTrim.length > 1000) {
      errors.descripcion =
        "La descripción no puede superar los 1000 caracteres";
    }

    if (observacionesTrim && observacionesTrim.length > 1000) {
      errors.observaciones =
        "Las observaciones no pueden superar los 1000 caracteres";
    }

    // Fechas: requerido, inicio <= fin
    if (!currentConvenio.fecha_inicio)
      errors.fecha_inicio = "La fecha de inicio es obligatoria";
    if (!currentConvenio.fecha_fin)
      errors.fecha_fin = "La fecha de fin es obligatoria";
    if (currentConvenio.fecha_inicio && currentConvenio.fecha_fin) {
      const inicio = new Date(currentConvenio.fecha_inicio);
      const fin = new Date(currentConvenio.fecha_fin);
      if (inicio > fin) {
        errors.fecha_inicio =
          "La fecha de inicio no puede ser mayor a la fecha de fin";
        errors.fecha_fin =
          "La fecha de fin no puede ser menor a la fecha de inicio";
      }
    }

    // Institución: requerido
    if (!currentConvenio.id_institucion)
      errors.id_institucion = "La institución es obligatoria";

    // Estado: requerido
    if (!currentConvenio.id_estado)
      errors.id_estado = "El estado es obligatorio";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar convenio
  const handleSave = async () => {
    if (!validateForm()) return;
    const { id, ...rest } = currentConvenio;

    const data = {
      ...rest,
      fecha_inicio: rest.fecha_inicio,
      fecha_fin: rest.fecha_fin,
      id_archivo: rest.id_archivo || null,
      id_institucion: Number(rest.id_institucion),
      id_estado: Number(rest.id_estado),
    };

    try {
      if (modalMode === "crear") {
        const res = await axios.post(API_URL, data);
        const nuevoId = res.data.data.id;
        const detalle = await axios.get(`${API_URL}/${nuevoId}`);
        setConvenios((prev) => [...prev, detalle.data.data]);
        setMessage("Convenio creado correctamente");
      } else {
        const res = await axios.put(`${API_URL}/${id}`, data);
        const actualizado = res.data.data;
        setConvenios((prev) =>
          prev.map((c) => (c.id === id ? actualizado : c)),
        );
        setMessage("Convenio actualizado correctamente");
      }
      setModalOpen(false);
      setValidationErrors({});
    } catch (err) {
      alert(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        "Error al guardar el convenio. Verifica los datos e intenta de nuevo.",
      );
    }
  };

  // Eliminar convenio
  const eliminarConvenio = async () => {
    if (!convenioToDelete) return;
    try {
      await axios.delete(`${API_URL}/${convenioToDelete.id}`);
      setConvenios((prev) => prev.filter((c) => c.id !== convenioToDelete.id));
      setMessage("Convenio eliminado correctamente");
      setDeleteConfirmOpen(false);
      setConvenioToDelete(null);
    } catch (err) {
      alert("Error al eliminar el convenio.");
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => setSearchTerm("");

  // Mensaje de éxito q desaparece
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // click afuera del modal para cerrar
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

  return (
    <AdminLayout>
      <div className="p-6 h-full flex flex-col">
        {/* Título, botón y búsqueda */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between mb-2 gap-4">
            <div className="flex-1 w-full">
              <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left mb-1">
                Gestor de Convenios
              </h1>
              <p className="text-gray-600 text-center sm:text-left">
                Administra los convenios del sistema
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:items-center gap-2">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon />
                Nuevo convenio
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
              {filteredConvenios.length} resultado
              {filteredConvenios.length !== 1 ? "s" : ""} encontrado
              {filteredConvenios.length !== 1 ? "s" : ""} para "{searchTerm}"
            </p>
          )}
        </div>

        {/* Tabla escritorio y cards mobile/tablet con loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando convenios...</p>
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
                onClick={fetchConvenios}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : filteredConvenios.length === 0 ? (
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
                    No se encontraron convenios que coincidan con "{searchTerm}"
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
                    No hay convenios cargados
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza creando tu primer convenio
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Crear primer convenio
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Tabla escritorio */}
            <div className="hidden lg:flex flex-1 min-h-0">
              <div className="bg-white border border-gray-300 rounded-lg shadow h-full flex flex-col w-full">
                <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div className="px-6 py-3">
                    {/* Encabezado de la tabla */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3 flex items-center h-full">
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
                          onClick={() => handleSort("institucion")}
                        >
                          Institución
                          {sortConfig.key === "institucion" &&
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
                          onClick={() => handleSort("fecha_inicio")}
                        >
                          Inicio
                          {sortConfig.key === "fecha_inicio" &&
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
                          onClick={() => handleSort("fecha_fin")}
                        >
                          Fin
                          {sortConfig.key === "fecha_fin" &&
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
                          onClick={() => handleSort("estado")}
                        >
                          Estado
                          {sortConfig.key === "estado" &&
                            (sortConfig.direction === "asc" ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            ))}
                        </button>
                      </div>
                      <div className="col-span-1 flex items-center justify-center h-full">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scroll-container">
                  <div className="divide-y divide-gray-200 pb-4">
                    {/* Filas de la tabla */}
                    {sortedConvenios.map((c) => (
                      <div
                        key={c.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3">
                            <p className="font-medium text-gray-900">
                              {c.nombre}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">
                              {instituciones.find(
                                (i) => i.id === c.id_institucion,
                              )?.nombre || "-"}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">
                              {formatDateForDisplay(c.fecha_inicio)}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">
                              {formatDateForDisplay(c.fecha_fin)}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${(() => {
                                const estado = estados.find(
                                  (e) => e.id === c.id_estado,
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
                                  (e) => e.id === c.id_estado,
                                );
                                return estado ? estado.nombre : "Sin estado";
                              })()}
                            </span>
                          </div>
                          <div className="col-span-1">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => setDetalleConvenio(c)}
                                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(c)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Editar"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => openDeleteModal(c)}
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
                {mobileVisibleConvenios.map((c, idx) => {
                  const isLast = idx === mobileVisibleConvenios.length - 1;
                  const estado = estados.find((e) => e.id === c.id_estado);
                  let estadoClass = "bg-gray-200 text-gray-700";
                  if (estado) {
                    if (estado.nombre.toLowerCase() === "pendiente")
                      estadoClass = "bg-yellow-100 text-yellow-800";
                    else if (estado.nombre.toLowerCase() === "finalizado")
                      estadoClass = "bg-blue-100 text-blue-800";
                    else if (estado.activo)
                      estadoClass = "bg-green-100 text-green-800";
                  }
                  return (
                    <div
                      key={c.id}
                      ref={isLast ? lastCardRef : undefined}
                      className="bg-white rounded-lg shadow border px-4 py-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {c.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateForDisplay(c.fecha_inicio)} -{" "}
                            {formatDateForDisplay(c.fecha_fin)}
                          </p>
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${estadoClass}`}
                        >
                          {estado ? estado.nombre : "Sin estado"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                        <span>
                          <b>Institución:</b>{" "}
                          {instituciones.find((i) => i.id === c.id_institucion)
                            ?.nombre || "-"}
                        </span>
                        {c.descripcion && (
                          <span>
                            <b>Desc:</b> {c.descripcion}
                          </span>
                        )}
                      </div>
                      {c.observaciones && (
                        <div
                          className="text-xs text-gray-500 truncate"
                          title={c.observaciones}
                        >
                          <b>Obs:</b> {c.observaciones}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setDetalleConvenio(c)}
                          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => openDeleteModal(c)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* cargando..... */}
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
                  {modalMode === "crear" ? "Nuevo Convenio" : "Editar Convenio"}
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
                    value={currentConvenio.nombre}
                    onChange={(e) => {
                      setCurrentConvenio({
                        ...currentConvenio,
                        nombre: e.target.value,
                      });
                      if (validationErrors.nombre) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          nombre: "",
                        }));
                      }
                    }}
                    placeholder="Ingrese el nombre del convenio"
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
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500 resize-none"
                    value={currentConvenio.descripcion || ""}
                    onChange={(e) =>
                      setCurrentConvenio({
                        ...currentConvenio,
                        descripcion: e.target.value,
                      })
                    }
                    placeholder="Descripción del convenio"
                    maxLength={500}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Institución <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_institucion"
                    value={currentConvenio.id_institucion}
                    onChange={(e) =>
                      setCurrentConvenio({
                        ...currentConvenio,
                        id_institucion: e.target.value,
                      })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_institucion
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                  >
                    <option value="" disabled>
                      Seleccionar institución
                    </option>
                    {instituciones.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.nombre}
                      </option>
                    ))}
                  </select>
                  {validationErrors.id_institucion && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.id_institucion}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Fecha de inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.fecha_inicio
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentConvenio.fecha_inicio}
                      onChange={(e) => {
                        setCurrentConvenio({
                          ...currentConvenio,
                          fecha_inicio: e.target.value,
                        });
                        if (validationErrors.fecha_inicio) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            fecha_inicio: "",
                          }));
                        }
                      }}
                    />
                    {validationErrors.fecha_inicio && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.fecha_inicio}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Fecha de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.fecha_fin
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentConvenio.fecha_fin}
                      onChange={(e) => {
                        setCurrentConvenio({
                          ...currentConvenio,
                          fecha_fin: e.target.value,
                        });
                        if (validationErrors.fecha_fin) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            fecha_fin: "",
                          }));
                        }
                      }}
                    />
                    {validationErrors.fecha_fin && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.fecha_fin}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Archivo
                  </label>
                  <select
                    name="id_archivo"
                    value={currentConvenio.id_archivo}
                    onChange={(e) =>
                      setCurrentConvenio({
                        ...currentConvenio,
                        id_archivo: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  >
                    <option value="">Sin archivo</option>
                    {archivos.map((arch) => (
                      <option key={arch.id} value={arch.id}>
                        {arch.nombre || `Archivo #${arch.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_estado"
                    value={currentConvenio.id_estado}
                    onChange={(e) =>
                      setCurrentConvenio({
                        ...currentConvenio,
                        id_estado: e.target.value,
                      })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_estado
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
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
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500 resize-none"
                    value={currentConvenio.observaciones || ""}
                    onChange={(e) =>
                      setCurrentConvenio({
                        ...currentConvenio,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Observaciones adicionales (opcional)"
                    maxLength={500}
                  />
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
      {detalleConvenio && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              window.getSelection().isCollapsed
            ) {
              setDetalleConvenio(null);
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
                  Detalle de Convenio
                </h2>
                <button
                  onClick={() => setDetalleConvenio(null)}
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
                  <b>Nombre:</b> {detalleConvenio.nombre}
                </div>
                <div>
                  <b>Descripción:</b> {detalleConvenio.descripcion || "-"}
                </div>
                <div>
                  <b>Institución:</b>{" "}
                  {instituciones.find(
                    (i) => i.id === detalleConvenio.id_institucion,
                  )?.nombre || "-"}
                </div>
                <div>
                  <b>Fecha inicio:</b>{" "}
                  {formatDateForDisplay(detalleConvenio.fecha_inicio)}
                </div>
                <div>
                  <b>Fecha fin:</b>{" "}
                  {formatDateForDisplay(detalleConvenio.fecha_fin)}
                </div>
                <div>
                  <b>Archivo:</b>{" "}
                  {detalleConvenio.id_archivo
                    ? (() => {
                      const arch = archivos.find(
                        (a) => a.id === detalleConvenio.id_archivo,
                      );
                      if (arch && arch.url_archivo) {
                        return (
                          <a
                            href={arch.url_archivo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-all"
                          >
                            {arch.nombre || `Archivo #${arch.id}`}
                          </a>
                        );
                      }
                      return arch
                        ? arch.nombre || `Archivo #${arch.id}`
                        : "Sin archivo";
                    })()
                    : "Sin archivo"}
                </div>
                <div>
                  <b>Estado:</b>{" "}
                  {(() => {
                    const estado = estados.find(
                      (e) => e.id === detalleConvenio.id_estado,
                    );
                    return estado ? estado.nombre : "Sin estado";
                  })()}
                </div>
                <div>
                  <b>Observaciones:</b> {detalleConvenio.observaciones || "-"}
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
                  ¿Estás seguro que querés eliminar el convenio:
                </p>
                <p className="font-semibold text-gray-900 mb-4">
                  "{convenioToDelete?.nombre}"
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
                    onClick={eliminarConvenio}
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

export default GestionConvenio;