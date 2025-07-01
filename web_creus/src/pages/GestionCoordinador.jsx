import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { Eye } from "lucide-react";

const ESTADO_API_URL = "http://localhost:5002/api/creus/api/estados";
const API_URL = "http://localhost:5002/api/creus/api/coordinador";
const PAGE_SIZE = 10;

const initialCoordinador = {
  id: null,
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  id_estado: 1,
  observaciones: "",
};

const GestionCoordinador = () => {
  //estadosprincipales
  const [coordinadores, setCoordinadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estados, setEstados] = useState([]);

  // estado busqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCoordinadores, setFilteredCoordinadores] = useState([]);

  //estados modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [currentCoordinador, setCurrentCoordinador] =
    useState(initialCoordinador);

  // Detalle de coordinador (estado)
  const [detalleCoordinador, setDetalleCoordinador] = useState(null);

  // estados modal eliminar
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [coordinadorToDelete, setCoordinadorToDelete] = useState(null);

  // Mensajes y validaciones
  const [message, setMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // responsive para móvil/tablet
  const [mobilePage, setMobilePage] = useState(1);
  const observer = useRef();
  const mobileVisibleCoordinadores = filteredCoordinadores.slice(
    0,
    mobilePage * PAGE_SIZE,
  );

  // Ordenamiento (se ordena por apellido de manera predeterminada)
  const [sortConfig, setSortConfig] = useState({
    key: "apellido",
    direction: "asc",
  });

  // buscar sin importar si es miniscula/mayuscula
  const normalize = (str) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // cargar coordinadores y estados
  useEffect(() => {
    fetchCoordinadores();
    fetchEstados();
  }, []);

  const fetchCoordinadores = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setCoordinadores(res.data.data || []);
      setError(null);
    } catch {
      setError("Error al cargar los coordinadores.");
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

  // filtrado por búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCoordinadores(coordinadores);
    } else {
      const normalizedSearch = normalize(searchTerm);
      setFilteredCoordinadores(
        coordinadores.filter((c) => {
          // Buscar por nombre, apellido, email, teléfono, observaciones o estado
          const estadoObj = estados.find((e) => e.id === c.id_estado);
          const estadoNombre = estadoObj ? normalize(estadoObj.nombre) : "";
          return (
            normalize(c.nombre).includes(normalizedSearch) ||
            normalize(c.apellido).includes(normalizedSearch) ||
            normalize(c.email).includes(normalizedSearch) ||
            (c.telefono && normalize(c.telefono).includes(normalizedSearch)) ||
            (c.observaciones &&
              normalize(c.observaciones).includes(normalizedSearch)) ||
            estadoNombre.includes(normalizedSearch)
          );
        }),
      );
    }
  }, [coordinadores, searchTerm, estados]);

  // ordenamiento
  const sortCoordinadores = (arr, config) => {
    if (!config.key) return arr;
    return [...arr].sort((a, b) => {
      const aValue = (a[config.key] || "").toString().toLowerCase();
      const bValue = (b[config.key] || "").toString().toLowerCase();
      if (aValue < bValue) return config.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return config.direction === "asc" ? 1 : -1;
      return 0;
    });
  };
  const sortedCoordinadores = sortCoordinadores(
    filteredCoordinadores,
    sortConfig,
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // scroll para móvil/tablet
  const lastCardRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          mobileVisibleCoordinadores.length < filteredCoordinadores.length
        ) {
          setMobilePage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [mobileVisibleCoordinadores.length, filteredCoordinadores.length],
  );

  // Modal crear/editar
  const openCreateModal = () => {
    setModalMode("crear");
    setCurrentCoordinador(initialCoordinador);
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  const openEditModal = (coordinador) => {
    setModalMode("editar");
    setCurrentCoordinador({
      ...coordinador,
      telefono: coordinador.telefono ? String(coordinador.telefono) : "",
      observaciones: coordinador.observaciones ?? "",
    });
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  // Modal eliminar
  const openDeleteModal = (coordinador) => {
    setCoordinadorToDelete(coordinador);
    setDeleteConfirmOpen(true);
  };

  // Validación de formulario
  const nombreRef = useRef(null);
  const apellidoRef = useRef(null);
  const emailRef = useRef(null);
  const telefonoRef = useRef(null);

  const validateForm = () => {
    const errors = {};
    const nombre = currentCoordinador.nombre.trim();
    const apellido = currentCoordinador.apellido.trim();
    const email = currentCoordinador.email.trim();
    const telefono = currentCoordinador.telefono.trim();
    const observaciones = currentCoordinador.observaciones || "";

    // Nombre
    if (!nombre) errors.nombre = "El nombre es obligatorio";
    else if (nombre.length < 1 || nombre.length > 255)
      errors.nombre = "El nombre debe tener entre 1 y 255 caracteres";
    else if (!/\S/.test(nombre))
      errors.nombre = "El nombre no puede ser solo espacios";

    // Apellido
    if (!apellido) errors.apellido = "El apellido es obligatorio";
    else if (apellido.length < 1 || apellido.length > 255)
      errors.apellido = "El apellido debe tener entre 1 y 255 caracteres";
    else if (!/\S/.test(apellido))
      errors.apellido = "El apellido no puede ser solo espacios";

    // Duplicado nombre+apellido
    const isDuplicate = coordinadores.some(
      (c) =>
        c.id !== currentCoordinador.id &&
        c.nombre.trim().toLowerCase() === nombre.toLowerCase() &&
        c.apellido.trim().toLowerCase() === apellido.toLowerCase(),
    );
    if (isDuplicate) {
      errors.nombre = "Ya existe un coordinador con ese nombre y apellido";
      errors.apellido = "Ya existe un coordinador con ese nombre y apellido";
    }

    // Email
    if (!email) errors.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "El email no tiene un formato válido";
    else if (email.length > 50)
      errors.email = "El email no puede superar los 50 caracteres";

    // Teléfono
    if (!telefono) errors.telefono = "El teléfono es obligatorio";
    else if (!/^\+?\d{8,20}$/.test(telefono))
      errors.telefono =
        "El teléfono debe tener entre 8 y 20 dígitos y puede comenzar con '+'";

    // Observaciones
    if (observaciones.length > 500)
      errors.observaciones =
        "Las observaciones no pueden superar los 500 caracteres";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar coordinador
  const handleSave = async () => {
    if (!validateForm()) return;
    const { id, ...rest } = currentCoordinador;
    const data = {
      ...rest,
      telefono: rest.telefono ? rest.telefono : null,
    };

    try {
      if (modalMode === "crear") {
        const res = await axios.post(API_URL, data);
        const nuevoId = res.data.data.id;
        const detalle = await axios.get(`${API_URL}/${nuevoId}`);
        setCoordinadores((prev) => [...prev, detalle.data.data]);
        setMessage("Coordinador creado correctamente");
      } else {
        const res = await axios.put(`${API_URL}/${id}`, data);
        const actualizado = res.data.data;
        setCoordinadores((prev) =>
          prev.map((c) => (c.id === id ? actualizado : c)),
        );
        setMessage("Coordinador actualizado correctamente");
      }
      setModalOpen(false);
      setValidationErrors({});
    } catch (err) {
      alert(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        "Error al guardar el coordinador. Verifica los datos e intenta de nuevo.",
      );
    }
  };

  // Eliminar coordinador (borrado lógico)
  const eliminarCoordinador = async () => {
    if (!coordinadorToDelete) return;
    try {
      await axios.delete(`${API_URL}/${coordinadorToDelete.id}`);
      setCoordinadores((prev) =>
        prev.filter((c) => c.id !== coordinadorToDelete.id),
      );
      setMessage("Coordinador eliminado correctamente");
      setDeleteConfirmOpen(false);
      setCoordinadorToDelete(null);
    } catch (err) {
      alert("Error al eliminar el coordinador.");
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => setSearchTerm("");

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
                Gestor de Coordinadores
              </h1>
              <p className="text-gray-600 text-center sm:text-left">
                Administra los coordinadores del sistema
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:items-center gap-2">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon />
                Nuevo coordinador
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
              {filteredCoordinadores.length} resultado
              {filteredCoordinadores.length !== 1 ? "s" : ""} encontrado
              {filteredCoordinadores.length !== 1 ? "s" : ""} para "{searchTerm}
              "
            </p>
          )}
        </div>

        {/* Tabla escritorio y cards celular/tablet con loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando coordinadores...</p>
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
                onClick={fetchCoordinadores}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : filteredCoordinadores.length === 0 ? (
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
                    No se encontraron coordinadores que coincidan con "
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
                    No hay coordinadores cargados
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza creando tu primer coordinador
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Crear primer coordinador
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
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-2 flex items-center h-full">
                        {/* Nombre */}
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
                        {/* Apellido */}
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort("apellido")}
                        >
                          Apellido
                          {sortConfig.key === "apellido" &&
                            (sortConfig.direction === "asc" ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            ))}
                        </button>
                      </div>
                      <div className="col-span-3 flex items-center h-full">
                        {/* Email*/}
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort("email")}
                        >
                          Email
                          {sortConfig.key === "email" &&
                            (sortConfig.direction === "asc" ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            ))}
                        </button>
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        {/* Teléfono */}
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort("telefono")}
                        >
                          Teléfono
                          {sortConfig.key === "telefono" &&
                            (sortConfig.direction === "asc" ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            ))}
                        </button>
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        {/* Estado */}
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort("id_estado")}
                        >
                          Estado
                          {sortConfig.key === "id_estado" &&
                            (sortConfig.direction === "asc" ? (
                              <span>&uarr;</span>
                            ) : (
                              <span>&darr;</span>
                            ))}
                        </button>
                      </div>
                      <div className="col-span-1 flex items-center justify-center h-full">
                        {/* Acciones */}
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scroll-container">
                  <div className="divide-y divide-gray-200 pb-4">
                    {sortedCoordinadores.map((c) => (
                      <div
                        key={c.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-2">
                            <p className="font-medium text-gray-900">
                              {c.nombre}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">{c.apellido}</p>
                          </div>
                          <div className="col-span-3">
                            <p className="text-gray-700 truncate">{c.email}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">{c.telefono || "-"}</p>
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
                                onClick={() => setDetalleCoordinador(c)}
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
                {mobileVisibleCoordinadores.map((c, idx) => {
                  const isLast = idx === mobileVisibleCoordinadores.length - 1;
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
                            {c.nombre} {c.apellido}
                          </p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${estadoClass}`}
                        >
                          {estado ? estado.nombre : "Sin estado"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                        {c.telefono && (
                          <span>
                            <b>Tel:</b> {c.telefono}
                          </span>
                        )}
                        {c.observaciones && (
                          <span>
                            <b>Obs:</b> {c.observaciones}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setDetalleCoordinador(c)}
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

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === "crear"
                    ? "Nuevo Coordinador"
                    : "Editar Coordinador"}
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

              <div className="flex flex-wrap gap-4">
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    ref={nombreRef}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.nombre
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentCoordinador.nombre}
                    onChange={(e) => {
                      setCurrentCoordinador({
                        ...currentCoordinador,
                        nombre: e.target.value,
                      });
                      if (validationErrors.nombre) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          nombre: "",
                        }));
                      }
                    }}
                    placeholder="Ingrese el nombre"
                    maxLength={255}
                  />
                  {validationErrors.nombre && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.nombre}
                    </p>
                  )}
                </div>

                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    ref={apellidoRef}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.apellido
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentCoordinador.apellido}
                    onChange={(e) => {
                      setCurrentCoordinador({
                        ...currentCoordinador,
                        apellido: e.target.value,
                      });
                      if (validationErrors.apellido) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          apellido: "",
                        }));
                      }
                    }}
                    placeholder="Ingrese el apellido"
                    maxLength={255}
                  />
                  {validationErrors.apellido && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.apellido}
                    </p>
                  )}
                </div>

                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    ref={emailRef}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.email
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentCoordinador.email}
                    onChange={(e) => {
                      setCurrentCoordinador({
                        ...currentCoordinador,
                        email: e.target.value,
                      });
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    placeholder="Ingrese el email"
                    maxLength={50}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    ref={telefonoRef}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.telefono
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentCoordinador.telefono || ""}
                    onChange={(e) => {
                      setCurrentCoordinador({
                        ...currentCoordinador,
                        telefono: e.target.value,
                      });
                      if (validationErrors.telefono) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          telefono: "",
                        }));
                      }
                    }}
                    placeholder="Teléfono"
                    maxLength={20}
                  />
                  {validationErrors.telefono && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.telefono}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block mb-2 font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500 resize-none"
                    value={currentCoordinador.observaciones || ""}
                    onChange={(e) =>
                      setCurrentCoordinador({
                        ...currentCoordinador,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Observaciones adicionales (opcional)"
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="w-full md:w-[48%]">
                <label className="block mb-2 font-medium text-gray-700">
                  Estado
                </label>
                <select
                  name="id_estado"
                  value={currentCoordinador.id_estado}
                  onChange={(e) =>
                    setCurrentCoordinador({
                      ...currentCoordinador,
                      id_estado: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Seleccionar estado
                  </option>
                  {Array.isArray(estados) &&
                    estados
                      .filter((e) => e.activo)
                      .map((estado) => (
                        <option key={estado.id} value={estado.id}>
                          {estado.nombre}
                        </option>
                      ))}
                </select>
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
      {detalleCoordinador && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setDetalleCoordinador(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalle de Coordinador
                </h2>
                <button
                  onClick={() => setDetalleCoordinador(null)}
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
                  <b>Nombre:</b> {detalleCoordinador.nombre}
                </div>
                <div>
                  <b>Apellido:</b> {detalleCoordinador.apellido}
                </div>
                <div>
                  <b>Email:</b> {detalleCoordinador.email}
                </div>
                <div>
                  <b>Teléfono:</b> {detalleCoordinador.telefono || "-"}
                </div>
                <div>
                  <b>Estado:</b>{" "}
                  {(() => {
                    const estado = estados.find(
                      (e) => e.id === detalleCoordinador.id_estado,
                    );
                    return estado ? estado.nombre : "Sin estado";
                  })()}
                </div>
                <div>
                  <b>Observaciones:</b>{" "}
                  {detalleCoordinador.observaciones || "-"}
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
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
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
                  ¿Estás seguro que querés eliminar el coordinador:
                </p>
                <p className="font-semibold text-gray-900 mb-4">
                  "{coordinadorToDelete?.nombre} {coordinadorToDelete?.apellido}
                  "
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
                    onClick={eliminarCoordinador}
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

export default GestionCoordinador;