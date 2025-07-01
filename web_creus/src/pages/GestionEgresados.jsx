import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { BookUser } from 'lucide-react';


const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const ClearIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const API_URL = "http://localhost:5002/api/creus/api/egresado";
const ESTADO_API_URL = "http://localhost:5002/api/creus/api/estados";
const PAGE_SIZE = 10;

const initialEgresado = {
  id: null,
  id_persona: "",
  fecha_egreso: "",
  id_cohorte: "",
  testimonio: "",
  id_estado: 1,
  observaciones: "",
};

const GestionEgresados = () => {
  const [egresados, setEgresados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estados, setEstados] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEgresados, setFilteredEgresados] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [currentEgresado, setCurrentEgresado] = useState(initialEgresado);
  const [detalleEgresado, setDetalleEgresado] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [egresadoToDelete, setEgresadoToDelete] = useState(null);
  const [message, setMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [mobilePage, setMobilePage] = useState(1);
  const observer = useRef();
  const mobileVisibleEgresados = filteredEgresados.slice(0, mobilePage * PAGE_SIZE);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Normalizar texto para búsqueda
  const normalize = (str) =>
    (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  useEffect(() => {
    fetchEgresados();
    fetchEstados();
  }, []);

  const fetchEgresados = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      // Asegura que siempre sea un array
      if (Array.isArray(res.data)) {
        setEgresados(res.data);
      } else if (Array.isArray(res.data.data)) {
        setEgresados(res.data.data);
      } else if (Array.isArray(res.data.message)) {
        setEgresados(res.data.message);
      } else {
        setEgresados([]);
      }
      setError(null);
    } catch {
      setError("Error al cargar los egresados.");
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
    let lista = Array.isArray(egresados) ? egresados : [];
    if (searchTerm.trim()) {
      const normalizedSearch = normalize(searchTerm);
      lista = lista.filter(e =>
        normalize(e.testimonio).includes(normalizedSearch) ||
        normalize(String(e.id_persona)).includes(normalizedSearch) ||
        normalize(String(e.id_cohorte)).includes(normalizedSearch) ||
        normalize(e.observaciones || "").includes(normalizedSearch)
      );
    }
    if (estadoFiltro) {
      lista = lista.filter(e => {
        const estado = estados.find(est => est.id === e.id_estado);
        if (!estado) return false;
        // Filtra por nombre de estado o por "activo"/"inactivo"
        if (estadoFiltro === "activo") return estado.activo;
        if (estadoFiltro === "inactivo") return !estado.activo;
        return estado.nombre.toLowerCase() === estadoFiltro;
      });
    }
    setFilteredEgresados(lista);
  }, [egresados, searchTerm, estadoFiltro, estados]);

  // Ordenamiento
  const sortEgresados = (egresados, config) => {
    if (!config.key) return egresados;
    return [...egresados].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];

      // Ordenar por número
      if (["id_persona", "id_cohorte"].includes(config.key)) {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      // Ordenar por fecha
      else if (config.key === "fecha_egreso") {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
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
  const sortedEgresados = sortEgresados(filteredEgresados, sortConfig);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Scroll infinito para móvil/tablet
  const lastCardRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && mobileVisibleEgresados.length < filteredEgresados.length) {
        setMobilePage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [mobileVisibleEgresados.length, filteredEgresados.length]);

  // Modal crear/editar
  const openCreateModal = () => {
    setModalMode("crear");
    setCurrentEgresado(initialEgresado);
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  const openEditModal = (egresado) => {
    setModalMode("editar");
    setCurrentEgresado({
      ...egresado,
      fecha_egreso: egresado.fecha_egreso
        ? (() => {
          const d = new Date(egresado.fecha_egreso);
          return d.toISOString().slice(0, 10);
        })()
        : "",
    });
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  // Modal eliminar
  const openDeleteModal = (egresado) => {
    setEgresadoToDelete(egresado);
    setDeleteConfirmOpen(true);
  };

  // Validación de formulario
  const validateForm = () => {
    const errors = {};
    if (!currentEgresado.id_persona) errors.id_persona = "El ID de persona es obligatorio";
    if (!currentEgresado.fecha_egreso) errors.fecha_egreso = "La fecha de egreso es obligatoria";
    if (!currentEgresado.id_cohorte) errors.id_cohorte = "El ID de cohorte es obligatorio";
    if (!currentEgresado.testimonio || currentEgresado.testimonio.trim().length < 5) errors.testimonio = "El testimonio debe tener al menos 5 caracteres";
    if (!currentEgresado.id_estado) errors.id_estado = "El estado es obligatorio";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar egresado
  const handleSave = async () => {
    if (!validateForm()) return;
    const { id, ...rest } = currentEgresado;
    const data = { ...rest };

    try {
      if (modalMode === "crear") {
        await axios.post(API_URL, data);
        await fetchEgresados();
        setMessage("Egresado creado correctamente");
      } else {
        await axios.put(`${API_URL}/${id}`, data);
        await fetchEgresados();
        setMessage("Egresado actualizado correctamente");
      }
      setModalOpen(false);
      setValidationErrors({});
    } catch (err) {
      // Manejo mejorado de errores de validación
      if (err.response?.data) {
        // Marshmallow puede devolver los errores en "message" o en "messages"
        const errores = err.response.data.errors || err.response.data.message || err.response.data.messages;
        if (typeof errores === "object" && errores !== null) {
          setValidationErrors(errores);
        } else {
          alert(errores || "Error al guardar el egresado. Verifica los datos e intenta de nuevo.");
        }
      } else {
        alert("Error al guardar el egresado. Verifica los datos e intenta de nuevo.");
      }
    }
  };

  // Eliminar egresado
  const eliminarEgresado = async () => {
    if (!egresadoToDelete) return;
    try {
      await axios.delete(`${API_URL}/${egresadoToDelete.id}`);
      setEgresados((prev) => prev.filter((e) => e.id !== egresadoToDelete.id));
      setMessage("Egresado eliminado correctamente");
      setDeleteConfirmOpen(false);
      setEgresadoToDelete(null);
    } catch (err) {
      alert("Error al eliminar el egresado.");
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

  function formatFechaEgreso(fecha) {
    if (!fecha) return "-";
    // Si es formato ISO 8601 con Z (UTC), ajusta a local
    const d = new Date(fecha);
    // Suma el desfase horario local
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  return (
    <AdminLayout>
      <div className="p-6 h-full flex flex-col">
        {/* Título, botón y búsqueda */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between mb-2 gap-4">
            <div className="flex-1 w-full">
              <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left mb-1">
                Gestor de Egresados
              </h1>
              <p className="text-gray-600 text-center sm:text-left">
                Administra los egresados del sistema
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:items-center gap-2">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon />
                Nuevo egresado
              </button>
            </div>
          </div>
          {message && (
            <div className="mb-4">
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
              {filteredEgresados.length} resultado{filteredEgresados.length !== 1 ? "s" : ""} encontrado{filteredEgresados.length !== 1 ? "s" : ""} para "{searchTerm}"
            </p>
          )}
        </div>

        {/* Tabla escritorio y cards mobile/tablet con loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando egresados...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchEgresados}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : filteredEgresados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-md text-center">
              {searchTerm ? (
                <>
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
                  <p className="text-gray-600 mb-4">No se encontraron egresados que coincidan con "{searchTerm}"</p>
                  <button
                    onClick={clearSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay egresados cargados</h3>
                  <p className="text-gray-600 mb-4">Comienza creando tu primer egresado</p>
                  <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Crear primer egresado
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Tabla escritorio */}
            <div className="hidden lg:flex flex-1 min-h-0">
              <div className="bg-white border border-gray-300 rounded-lg shadow h-full flex flex-col">
                <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div className="px-6 py-3">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-2 flex items-center h-full">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort('id_persona')}
                        >
                          ID Persona
                          {sortConfig.key === 'id_persona' && (
                            sortConfig.direction === 'asc' ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            )
                          )}
                        </button>
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort('fecha_egreso')}
                        >
                          Fecha Egreso
                          {sortConfig.key === 'fecha_egreso' && (
                            sortConfig.direction === 'asc' ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            )
                          )}
                        </button>
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort('id_cohorte')}
                        >
                          Cohorte
                          {sortConfig.key === 'id_cohorte' && (
                            sortConfig.direction === 'asc' ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            )
                          )}
                        </button>
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Testimonio</span>
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center h-full">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scroll-container">
                  <div className="divide-y divide-gray-200 pb-4">
                    {sortedEgresados.map((e) => (
                      <div key={e.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-2">
                            <p className="font-medium text-gray-900">{e.id_persona}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">
                              {formatFechaEgreso(e.fecha_egreso)}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">{e.id_cohorte}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700 truncate" title={e.testimonio}>{e.testimonio}</p>
                          </div>
                          <div className="col-span-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${(() => {
                              const estado = estados.find(est => est.id === e.id_estado);
                              if (!estado) return "bg-gray-200 text-gray-700";
                              if (estado.nombre.toLowerCase() === "pendiente") return "bg-yellow-100 text-yellow-800";
                              if (estado.nombre.toLowerCase() === "finalizado") return "bg-blue-100 text-blue-800";
                              if (estado.activo) return "bg-green-100 text-green-800";
                              return "bg-gray-200 text-gray-700";
                            })()
                              }`}>
                              {(() => {
                                const estado = estados.find(est => est.id === e.id_estado);
                                return estado ? estado.nombre : "Sin estado";
                              })()}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => setDetalleEgresado(e)}
                                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Ver detalles"
                              >
                                <BookUser />
                              </button>
                              <button
                                onClick={() => openEditModal(e)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Editar"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => openDeleteModal(e)}
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
                {mobileVisibleEgresados.map((e, idx) => {
                  const isLast = idx === mobileVisibleEgresados.length - 1;
                  const estado = estados.find(est => est.id === e.id_estado);
                  return (
                    <div
                      key={e.id}
                      ref={isLast ? lastCardRef : undefined}
                      className="bg-white rounded-lg shadow border px-4 py-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">ID Persona: {e.id_persona}</p>
                          <p className="text-xs text-gray-500">Cohorte: {e.id_cohorte}</p>
                        </div>
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700">
                          {estado ? estado.nombre : "Sin estado"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                        <span><b>Fecha egreso:</b> {formatFechaEgreso(e.fecha_egreso)}</span>                                                <span><b>Testimonio:</b> {e.testimonio}</span>
                      </div>
                      {e.observaciones && (
                        <div className="text-xs text-gray-500 truncate" title={e.observaciones}>
                          <b>Obs:</b> {e.observaciones}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setDetalleEgresado(e)}
                          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <BookUser />
                        </button>
                        <button
                          onClick={() => openEditModal(e)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => openDeleteModal(e)}
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
                  {modalMode === "crear" ? "Nuevo Egresado" : "Editar Egresado"}
                </h2>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setValidationErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    ID Persona <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_persona
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentEgresado.id_persona}
                    onChange={(e) => setCurrentEgresado({ ...currentEgresado, id_persona: e.target.value })}
                    placeholder="ID de persona"
                  />
                  {validationErrors.id_persona && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.id_persona}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Fecha de egreso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.fecha_egreso
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentEgresado.fecha_egreso}
                    onChange={(e) => setCurrentEgresado({ ...currentEgresado, fecha_egreso: e.target.value })}
                  />
                  {validationErrors.fecha_egreso && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.fecha_egreso}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    ID Cohorte <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_cohorte
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentEgresado.id_cohorte}
                    onChange={(e) => setCurrentEgresado({ ...currentEgresado, id_cohorte: e.target.value })}
                    placeholder="ID de cohorte"
                  />
                  {validationErrors.id_cohorte && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.id_cohorte}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Testimonio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.testimonio
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentEgresado.testimonio}
                    onChange={(e) => setCurrentEgresado({ ...currentEgresado, testimonio: e.target.value })}
                    placeholder="Testimonio"
                    maxLength={3000}
                  />
                  {validationErrors.testimonio && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.testimonio}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {(currentEgresado.testimonio || "").length}/3000 caracteres
                  </p>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Observaciones</label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500 resize-none"
                    value={currentEgresado.observaciones || ""}
                    onChange={(e) => setCurrentEgresado({ ...currentEgresado, observaciones: e.target.value })}
                    placeholder="Observaciones adicionales (opcional)"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {(currentEgresado.observaciones || "").length}/500 caracteres
                  </p>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Estado</label>
                  <select
                    name="id_estado"
                    value={currentEgresado.id_estado}
                    onChange={e => setCurrentEgresado({ ...currentEgresado, id_estado: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  >
                    <option value="" disabled>Seleccionar estado</option>
                    {Array.isArray(estados) && estados.map(estado => (
                      <option key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </option>
                    ))}
                  </select>
                  {validationErrors.id_estado && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.id_estado}</p>
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
      {detalleEgresado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Detalle de Egresado</h2>
                <button
                  onClick={() => setDetalleEgresado(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div><b>ID Persona:</b> {detalleEgresado.id_persona}</div>
                <div><b>Fecha de egreso:</b> {formatFechaEgreso(detalleEgresado.fecha_egreso)}</div>
                <div><b>ID Cohorte:</b> {detalleEgresado.id_cohorte}</div>
                <div><b>Testimonio:</b> {detalleEgresado.testimonio}</div>
                <div><b>Estado:</b> {
                  (() => {
                    const estado = estados.find(e => e.id === detalleEgresado.id_estado);
                    return estado ? estado.nombre : "Sin estado";
                  })()
                }</div>
                <div><b>Observaciones:</b> {detalleEgresado.observaciones || "-"}</div>
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
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmar eliminación</h3>
                <p className="text-gray-600 mb-2">
                  ¿Estás seguro que querés eliminar el egresado:
                </p>
                <p className="font-semibold text-gray-900 mb-4">
                  ID Persona: {egresadoToDelete?.id_persona}
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
                    onClick={eliminarEgresado}
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

export default GestionEgresados;