import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { Eye } from "lucide-react";

const ESTADO_API_URL = "http://localhost:5002/api/creus/api/estados";
const API_URL = "http://localhost:5002/api/creus/api/institucion";
const PAGE_SIZE = 10;

const initialInstitucion = {
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

const GestionInstituciones = () => {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estados, setEstados] = useState([]);

  // Búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInstituciones, setFilteredInstituciones] = useState([]);

  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [currentInstitucion, setCurrentInstitucion] =
    useState(initialInstitucion);

  // Detalle de institución
  const [detalleInstitucion, setDetalleInstitucion] = useState(null);

  // Modal eliminar
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [institucionToDelete, setInstitucionToDelete] = useState(null);

  // Mensajes y validaciones
  const [message, setMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Responsive: paginación para móvil/tablet
  const [mobilePage, setMobilePage] = useState(1);
  const observer = useRef();
  const mobileVisibleInstituciones = filteredInstituciones.slice(
    0,
    mobilePage * PAGE_SIZE,
  );

  // Ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Normalizar texto para búsqueda
  const normalize = (str) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Cargar instituciones
  useEffect(() => {
    fetchInstituciones();
    fetchEstados();
  }, []);

  const fetchInstituciones = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setInstituciones(res.data.data || []);
      setError(null);
    } catch {
      setError("Error al cargar las instituciones.");
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

  // Filtrado por búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInstituciones(instituciones);
    } else {
      const normalizedSearch = normalize(searchTerm);
      setFilteredInstituciones(
        instituciones.filter((inst) => {
          const estadoObj = estados.find((e) => e.id === inst.id_estado);
          const estadoNombre = estadoObj ? normalize(estadoObj.nombre) : "";
          return (
            normalize(inst.nombre).includes(normalizedSearch) ||
            normalize(inst.ciudad).includes(normalizedSearch) ||
            normalize(inst.provincia).includes(normalizedSearch) ||
            normalize(inst.pais).includes(normalizedSearch) ||
            (inst.observaciones &&
              normalize(inst.observaciones).includes(normalizedSearch)) ||
            estadoNombre.includes(normalizedSearch) ||
            normalize(inst.codigo_postal || "").includes(normalizedSearch) ||
            normalize(inst.calle || "").includes(normalizedSearch) ||
            String(inst.numero || "").includes(searchTerm) ||
            normalize(inst.email || "").includes(normalizedSearch) ||
            normalize(String(inst.telefono || "")).includes(normalizedSearch) ||
            normalize(inst.pagina_web || "").includes(normalizedSearch)
          );
        }),
      );
    }
  }, [instituciones, searchTerm, estados]);

  // Ordenamiento
  // Ordenamiento
  const sortInstituciones = (instituciones, config) => {
    if (!config.key) return instituciones;
    return [...instituciones].sort((a, b) => {
      let aValue, bValue;
      if (config.key === "estado") {
        const aEstado = estados.find((e) => e.id === a.id_estado);
        const bEstado = estados.find((e) => e.id === b.id_estado);
        aValue = (aEstado?.nombre || "").toLowerCase();
        bValue = (bEstado?.nombre || "").toLowerCase();
      } else {
        aValue = (a[config.key] || "").toString().toLowerCase();
        bValue = (b[config.key] || "").toString().toLowerCase();
      }
      if (aValue < bValue) return config.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return config.direction === "asc" ? 1 : -1;
      return 0;
    });
  };
  const sortedInstituciones = sortInstituciones(
    filteredInstituciones,
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
  // Scroll para móvil/tablet
  const lastCardRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          mobileVisibleInstituciones.length < filteredInstituciones.length
        ) {
          setMobilePage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [mobileVisibleInstituciones.length, filteredInstituciones.length],
  );

  // Modal crear/editar
  const openCreateModal = () => {
    setModalMode("crear");
    setCurrentInstitucion(initialInstitucion);
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  const openEditModal = (institucion) => {
    setModalMode("editar");
    setCurrentInstitucion({
      ...institucion,
      telefono: institucion.telefono ? String(institucion.telefono) : "",
      numero: institucion.numero ? String(institucion.numero) : "",
    });
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  // Modal eliminar
  const openDeleteModal = (institucion) => {
    setInstitucionToDelete(institucion);
    setDeleteConfirmOpen(true);
  };

  // Validación de formulario
  const validateForm = () => {
    const errors = {};
    const nombreTrim = currentInstitucion.nombre.trim();
    const emailTrim = currentInstitucion.email.trim().toLowerCase();
    const numeroTrim = currentInstitucion.numero
      ? String(currentInstitucion.numero).trim()
      : "";
    const telefonoTrim = currentInstitucion.telefono
      ? String(currentInstitucion.telefono).trim()
      : "";
    const paginaWebTrim = currentInstitucion.pagina_web
      ? currentInstitucion.pagina_web.trim()
      : "";
    const calleTrim = currentInstitucion.calle.trim();
    const ciudadTrim = currentInstitucion.ciudad.trim();
    const provinciaTrim = currentInstitucion.provincia.trim();
    const paisTrim = currentInstitucion.pais.trim();
    const codigoPostalTrim = currentInstitucion.codigo_postal
      ? currentInstitucion.codigo_postal.trim()
      : "";
    const observacionesTrim = currentInstitucion.observaciones
      ? currentInstitucion.observaciones.trim()
      : "";

    // Nombre
    if (!nombreTrim) {
      errors.nombre = "El nombre es obligatorio";
    } else if (nombreTrim.length > 255) {
      errors.nombre = "El nombre no puede superar los 255 caracteres";
    } else if (
      instituciones.some(
        (i) =>
          i.nombre.trim().toLowerCase() === nombreTrim.toLowerCase() &&
          i.id !== currentInstitucion.id,
      )
    ) {
      errors.nombre = "Ya existe una institución con ese nombre";
    }

    // Email
    if (!emailTrim) {
      errors.email = "El email es obligatorio";
    } else if (emailTrim.length > 255) {
      errors.email = "El email no puede superar los 255 caracteres";
    } else if (
      instituciones.some(
        (i) =>
          (i.email || "").trim().toLowerCase() === emailTrim &&
          i.id !== currentInstitucion.id,
      )
    ) {
      errors.email = "Ya existe una institución con ese email";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailTrim)) {
      errors.email = "El email no tiene un formato válido";
    }

    // Teléfono
    if (telefonoTrim && isNaN(Number(telefonoTrim))) {
      errors.telefono = "El teléfono debe ser numérico";
    }

    // Página web:
    if (paginaWebTrim) {
      if (paginaWebTrim.length > 255) {
        errors.pagina_web = "El sitio web no puede superar los 255 caracteres";
      }
      const webRegex =
        /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
      if (!webRegex.test(paginaWebTrim)) {
        errors.pagina_web = "El sitio web no tiene un formato válido";
      }
      if (
        instituciones.some(
          (i) =>
            (i.pagina_web || "").trim().toLowerCase() ===
            paginaWebTrim.toLowerCase() && i.id !== currentInstitucion.id,
        )
      ) {
        errors.pagina_web = "Ya existe una institución con ese sitio web";
      }
    }

    // Calle
    if (!calleTrim) errors.calle = "La calle es obligatoria";
    else if (calleTrim.length > 255)
      errors.calle = "La calle no puede superar los 255 caracteres";

    // Número:
    if (!numeroTrim || isNaN(Number(numeroTrim))) {
      errors.numero = "El número es obligatorio";
    } else if (Number(numeroTrim) <= 0) {
      errors.numero = "El número debe ser mayor a 0";
    } else if (
      instituciones.some(
        (i) =>
          String(i.numero).trim() === numeroTrim &&
          i.calle.trim().toLowerCase() === calleTrim.toLowerCase() &&
          i.id !== currentInstitucion.id,
      )
    ) {
      errors.numero = "Ya existe una institución con ese número y calle";
    }

    // Ciudad
    if (!ciudadTrim) errors.ciudad = "La ciudad es obligatoria";
    else if (ciudadTrim.length > 255)
      errors.ciudad = "La ciudad no puede superar los 255 caracteres";

    // Provincia:
    if (!provinciaTrim) errors.provincia = "La provincia es obligatoria";
    else if (provinciaTrim.length > 255)
      errors.provincia = "La provincia no puede superar los 255 caracteres";

    // País
    if (!paisTrim) errors.pais = "El país es obligatorio";
    else if (paisTrim.length > 255)
      errors.pais = "El país no puede superar los 255 caracteres";

    // Código postal
    if (codigoPostalTrim && codigoPostalTrim.length > 20) {
      errors.codigo_postal =
        "El código postal no puede superar los 20 caracteres";
    }

    // Observaciones
    if (observacionesTrim && observacionesTrim.length > 500) {
      errors.observaciones =
        "Las observaciones no pueden superar los 500 caracteres";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar institución
  const handleSave = async () => {
    if (!validateForm()) return;
    const { id, ...rest } = currentInstitucion;

    const data = {
      ...rest,
      numero: rest.numero ? parseInt(rest.numero, 10) : null,
      telefono: rest.telefono ? parseInt(rest.telefono, 10) : null,
    };

    try {
      if (modalMode === "crear") {
        const res = await axios.post(API_URL, data);
        const nuevoId = res.data.data.id;
        const detalle = await axios.get(`${API_URL}/${nuevoId}`);
        setInstituciones((prev) => [...prev, detalle.data.data]);
        setMessage("Institución creada correctamente");
      } else {
        const res = await axios.put(`${API_URL}/${id}`, data);
        const actualizado = res.data.data;
        setInstituciones((prev) =>
          prev.map((inst) => (inst.id === id ? actualizado : inst)),
        );
        setMessage("Institución actualizada correctamente");
      }
      setModalOpen(false);
      setValidationErrors({});
    } catch (err) {
      alert(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        "Error al guardar la institución. Verifica los datos e intenta de nuevo.",
      );
    }
  };

  // Eliminar institución
  const eliminarInstitucion = async () => {
    if (!institucionToDelete) return;
    try {
      await axios.delete(`${API_URL}/${institucionToDelete.id}`);
      setInstituciones((prev) =>
        prev.filter((inst) => inst.id !== institucionToDelete.id),
      );
      setMessage("Institución eliminada correctamente");
      setDeleteConfirmOpen(false);
      setInstitucionToDelete(null);
    } catch (err) {
      alert("Error al eliminar la institución.");
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => setSearchTerm("");

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
                Gestor de Instituciones
              </h1>
              <p className="text-gray-600 text-center sm:text-left">
                Administra las instituciones del sistema
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:items-center gap-2">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon />
                Nueva institución
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
              {filteredInstituciones.length} resultado
              {filteredInstituciones.length !== 1 ? "s" : ""} encontrado
              {filteredInstituciones.length !== 1 ? "s" : ""} para "{searchTerm}
              "
            </p>
          )}
        </div>

        {/* Tabla escritorio y cards mobile/tablet con loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando instituciones...</p>
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
                onClick={fetchInstituciones}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : filteredInstituciones.length === 0 ? (
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
                    No se encontraron instituciones que coincidan con "
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
                    No hay instituciones cargadas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza creando tu primera institución
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Crear primera institución
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
                      <div className="col-span-3 flex items-center h-full">
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
                    {sortedInstituciones.map((inst) => (
                      <div
                        key={inst.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-2">
                            <p className="font-medium text-gray-900">
                              {inst.nombre}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">
                              {inst.telefono || "-"}
                            </p>
                          </div>
                          <div className="col-span-3">
                            <span
                              className="block truncate max-w-full text-gray-700"
                              title={inst.email}
                              style={{
                                cursor:
                                  inst.email && inst.email.length > 28
                                    ? "pointer"
                                    : "default",
                                maxWidth: "220px",
                              }}
                            >
                              {inst.email && inst.email.length > 28
                                ? inst.email.slice(0, 28) + "..."
                                : inst.email}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">{inst.ciudad}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">{inst.provincia}</p>
                          </div>
                          <div className="col-span-1">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => setDetalleInstitucion(inst)}
                                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(inst)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Editar"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => openDeleteModal(inst)}
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
                {mobileVisibleInstituciones.map((inst, idx) => {
                  const isLast = idx === mobileVisibleInstituciones.length - 1;
                  const estado = estados.find((e) => e.id === inst.id_estado);
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
                      key={inst.id}
                      ref={isLast ? lastCardRef : undefined}
                      className="bg-white rounded-lg shadow border px-4 py-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {inst.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inst.ciudad}, {inst.provincia}, {inst.pais}
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
                          <b>Email:</b> {inst.email}
                        </span>
                        {inst.telefono && (
                          <span>
                            <b>Tel:</b> {inst.telefono}
                          </span>
                        )}
                        {inst.pagina_web && (
                          <span>
                            <b>Web:</b> {inst.pagina_web}
                          </span>
                        )}
                        <span>
                          <b>Dirección:</b> {inst.calle} {inst.numero}
                        </span>
                        {inst.codigo_postal && (
                          <span>
                            <b>CP:</b> {inst.codigo_postal}
                          </span>
                        )}
                      </div>
                      {inst.observaciones && (
                        <div
                          className="text-xs text-gray-500 truncate"
                          title={inst.observaciones}
                        >
                          <b>Obs:</b> {inst.observaciones}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setDetalleInstitucion(inst)}
                          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(inst)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => openDeleteModal(inst)}
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
                  {modalMode === "crear"
                    ? "Nueva Institución"
                    : "Editar Institución"}
                </h2>
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
                    value={currentInstitucion.nombre}
                    onChange={(e) => {
                      setCurrentInstitucion({
                        ...currentInstitucion,
                        nombre: e.target.value,
                      });
                      if (validationErrors.nombre) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          nombre: "",
                        }));
                      }
                    }}
                    placeholder="Ingrese el nombre de la institución"
                    maxLength={255}
                  />
                  {validationErrors.nombre && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.nombre}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {currentInstitucion.nombre.length}/255 caracteres
                  </p>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.email
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                      }`}
                    value={currentInstitucion.email}
                    onChange={(e) => {
                      setCurrentInstitucion({
                        ...currentInstitucion,
                        email: e.target.value,
                      });
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    placeholder="Ingrese el email"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                      value={currentInstitucion.telefono || ""}
                      onChange={(e) =>
                        setCurrentInstitucion({
                          ...currentInstitucion,
                          telefono: e.target.value,
                        })
                      }
                      placeholder="Teléfono"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Página web
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.pagina_web
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentInstitucion.pagina_web || ""}
                      onChange={(e) => {
                        setCurrentInstitucion({
                          ...currentInstitucion,
                          pagina_web: e.target.value,
                        });
                        if (validationErrors.pagina_web) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            pagina_web: "",
                          }));
                        }
                      }}
                      placeholder="Página web"
                    />
                    {validationErrors.pagina_web && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.pagina_web}
                      </p>
                    )}
                  </div>
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
                      value={currentInstitucion.calle}
                      onChange={(e) => {
                        setCurrentInstitucion({
                          ...currentInstitucion,
                          calle: e.target.value,
                        });
                        if (validationErrors.calle) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            calle: "",
                          }));
                        }
                      }}
                      placeholder="Calle"
                      maxLength={255}
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
                      type="number"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.numero
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentInstitucion.numero}
                      onChange={(e) => {
                        setCurrentInstitucion({
                          ...currentInstitucion,
                          numero: e.target.value,
                        });
                        if (validationErrors.numero) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            numero: "",
                          }));
                        }
                      }}
                      placeholder="Número"
                      min={1}
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
                      value={currentInstitucion.ciudad}
                      onChange={(e) => {
                        setCurrentInstitucion({
                          ...currentInstitucion,
                          ciudad: e.target.value,
                        });
                        if (validationErrors.ciudad) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            ciudad: "",
                          }));
                        }
                      }}
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
                      value={currentInstitucion.provincia}
                      onChange={(e) => {
                        setCurrentInstitucion({
                          ...currentInstitucion,
                          provincia: e.target.value,
                        });
                        if (validationErrors.provincia) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            provincia: "",
                          }));
                        }
                      }}
                      placeholder="Provincia"
                    />
                    {validationErrors.provincia && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.provincia}
                      </p>
                    )}
                  </div>
                </div>
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
                    value={currentInstitucion.pais}
                    onChange={(e) => {
                      setCurrentInstitucion({
                        ...currentInstitucion,
                        pais: e.target.value,
                      });
                      if (validationErrors.pais) {
                        setValidationErrors((prev) => ({ ...prev, pais: "" }));
                      }
                    }}
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
                    Código postal
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                    value={currentInstitucion.codigo_postal || ""}
                    onChange={(e) =>
                      setCurrentInstitucion({
                        ...currentInstitucion,
                        codigo_postal: e.target.value,
                      })
                    }
                    placeholder="Código postal"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500 resize-none"
                    value={currentInstitucion.observaciones || ""}
                    onChange={(e) =>
                      setCurrentInstitucion({
                        ...currentInstitucion,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Observaciones adicionales (opcional)"
                    maxLength={500}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    name="id_estado"
                    value={currentInstitucion.id_estado}
                    onChange={(e) =>
                      setCurrentInstitucion({
                        ...currentInstitucion,
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
      {detalleInstitucion && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              window.getSelection().isCollapsed
            ) {
              setDetalleInstitucion(null);
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
                  Detalle de Institución
                </h2>
                <button
                  onClick={() => setDetalleInstitucion(null)}
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
                  <b>Nombre:</b> {detalleInstitucion.nombre}
                </div>
                <div>
                  <b>Dirección:</b>{" "}
                  {[
                    `${detalleInstitucion.calle} ${detalleInstitucion.numero}`,
                    detalleInstitucion.codigo_postal
                      ? `${detalleInstitucion.ciudad} (CP ${detalleInstitucion.codigo_postal})`
                      : detalleInstitucion.ciudad,
                    detalleInstitucion.provincia,
                    detalleInstitucion.pais,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                <div>
                  <b>Email:</b> {detalleInstitucion.email}
                </div>
                <div>
                  <b>Teléfono:</b> {detalleInstitucion.telefono || "-"}
                </div>
                <div>
                  <b>Página web:</b>{" "}
                  {detalleInstitucion.pagina_web ? (
                    <a
                      href={
                        /^https?:\/\//i.test(detalleInstitucion.pagina_web)
                          ? detalleInstitucion.pagina_web
                          : `https://${detalleInstitucion.pagina_web}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {detalleInstitucion.pagina_web}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
                <div>
                  <b>Estado:</b>{" "}
                  {(() => {
                    const estado = estados.find(
                      (e) => e.id === detalleInstitucion.id_estado,
                    );
                    return estado ? estado.nombre : "Sin estado";
                  })()}
                </div>
                <div>
                  <b>Observaciones:</b>{" "}
                  {detalleInstitucion.observaciones || "-"}
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
                  ¿Estás seguro que querés eliminar la institución:
                </p>
                <p className="font-semibold text-gray-900 mb-4">
                  "{institucionToDelete?.nombre}"
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
                    onClick={eliminarInstitucion}
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

export default GestionInstituciones;