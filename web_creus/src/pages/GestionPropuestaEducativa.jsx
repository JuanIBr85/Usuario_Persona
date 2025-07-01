import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { Eye } from "lucide-react";

const API_URL = "http://localhost:5002/api/creus/api/propuestas";
const MODALIDADES_URL = "http://localhost:5002/api/creus/api/modalidad";
const TIPOS_URL = "http://localhost:5002/api/creus/api/tipos-propuesta";
const ESTADOS_URL = "http://localhost:5002/api/creus/api/estados";
const AREAS_URL = "http://localhost:5002/api/creus/api/areas-conocimiento";
const TITULOS_URL = "http://localhost:5002/api/creus/api/certificaciones";
const CONVENIOS_URL = "http://localhost:5002/api/creus/api/convenio";
const PAGE_SIZE = 10;

const initialPropuesta = {
  id: null,
  nombre: "",
  descripcion: "",
  duracion: "",
  titulo_otorgado: "",
  requisitos_ingreso: "",
  perfil_egresado: "",
  salida_laboral: "",
  observaciones: "",
  id_modalidad: "",
  id_convenio: "",
  id_tipo_propuesta: "",
  id_estado: 1,
  id_area_conocimiento: "",
  id_titulo_certificacion: "",
};

const GestionPropuestaEducativa = () => {
  const [propuestas, setPropuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalidades, setModalidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [areas, setAreas] = useState([]);
  const [titulos, setTitulos] = useState([]);
  const [convenios, setConvenios] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPropuestas, setFilteredPropuestas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [currentPropuesta, setCurrentPropuesta] = useState(initialPropuesta);
  const [detallePropuesta, setDetallePropuesta] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [propuestaToDelete, setPropuestaToDelete] = useState(null);
  const [message, setMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [mobilePage, setMobilePage] = useState(1);
  const observer = useRef();
  const mobileVisiblePropuestas = filteredPropuestas.slice(
    0,
    mobilePage * PAGE_SIZE,
  );

  //retornan strings
  const getModalidadNombre = (id) => {
    const m = Array.isArray(modalidades)
      ? modalidades.find((i) => i.id === id)
      : null;
    return m ? m.nombre : "";
  };
  const getTipoNombre = (id) => {
    const t = Array.isArray(tipos) ? tipos.find((i) => i.id === id) : null;
    return t ? t.nombre : "";
  };
  const getEstadoNombre = (id) => {
    const e = Array.isArray(estados) ? estados.find((i) => i.id === id) : null;
    return e ? e.nombre : "";
  };
  const getAreaNombre = (id) => {
    const a = Array.isArray(areas) ? areas.find((i) => i.id === id) : null;
    return a ? a.nombre : "";
  };
  const getTituloNombre = (id) => {
    const t = Array.isArray(titulos) ? titulos.find((i) => i.id === id) : null;
    return t ? t.nombre : "";
  };
  const getConvenioNombre = (id) => {
    const c = Array.isArray(convenios)
      ? convenios.find((i) => i.id === id)
      : null;
    return c ? c.nombre : "";
  };

  // Cargar datos
  useEffect(() => {
    fetchPropuestas();
    fetchModalidades();
    fetchTipos();
    fetchEstados();
    fetchAreas();
    fetchTitulos();
    fetchConvenios();
  }, []);

  const fetchPropuestas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setPropuestas(res.data.data || []);
      setError(null);
    } catch {
      setError("Error al cargar las propuestas educativas.");
    } finally {
      setLoading(false);
    }
  };
  const fetchModalidades = async () => {
    try {
      const res = await axios.get(MODALIDADES_URL);
      if (Array.isArray(res.data)) {
        setModalidades(res.data);
      } else if (Array.isArray(res.data.data)) {
        setModalidades(res.data.data);
      } else if (Array.isArray(res.data.message)) {
        setModalidades(res.data.message);
      } else {
        setModalidades([]);
      }
    } catch {
      setModalidades([]);
    }
  };
  const fetchTipos = async () => {
    try {
      const res = await axios.get(TIPOS_URL);
      setTipos(res.data.data || []);
    } catch {
      setTipos([]);
    }
  };
  const fetchEstados = async () => {
    try {
      const res = await axios.get(ESTADOS_URL);
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
  const fetchAreas = async () => {
    try {
      const res = await axios.get(AREAS_URL);
      setAreas(res.data.data || []);
    } catch {
      setAreas([]);
    }
  };
  const fetchTitulos = async () => {
    try {
      const res = await axios.get(TITULOS_URL);
      setTitulos(res.data.data || []);
    } catch {
      setTitulos([]);
    }
  };
  const fetchConvenios = async () => {
    try {
      const res = await axios.get(CONVENIOS_URL);
      setConvenios(res.data.data || []);
    } catch {
      setConvenios([]);
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
      setFilteredPropuestas(propuestas);
    } else {
      const normalizedSearch = normalize(searchTerm);
      setFilteredPropuestas(
        propuestas.filter((p) => {
          const modalidad = getModalidadNombre(p.id_modalidad);
          const tipo = getTipoNombre(p.id_tipo_propuesta);
          const estado = getEstadoNombre(p.id_estado);
          const area = getAreaNombre(p.id_area_conocimiento);
          const titulo = getTituloNombre(p.id_titulo_certificacion);
          const convenio = getConvenioNombre(p.id_convenio);
          return (
            normalize(p.nombre).includes(normalizedSearch) ||
            normalize(p.descripcion).includes(normalizedSearch) ||
            normalize(p.duracion).includes(normalizedSearch) ||
            normalize(p.titulo_otorgado).includes(normalizedSearch) ||
            normalize(p.requisitos_ingreso).includes(normalizedSearch) ||
            normalize(p.perfil_egresado).includes(normalizedSearch) ||
            normalize(p.salida_laboral).includes(normalizedSearch) ||
            normalize(p.observaciones).includes(normalizedSearch) ||
            normalize(modalidad).includes(normalizedSearch) ||
            normalize(tipo).includes(normalizedSearch) ||
            normalize(estado).includes(normalizedSearch) ||
            normalize(area).includes(normalizedSearch) ||
            normalize(titulo).includes(normalizedSearch) ||
            normalize(convenio).includes(normalizedSearch)
          );
        }),
      );
    }
  }, [
    propuestas,
    searchTerm,
    modalidades,
    tipos,
    estados,
    areas,
    titulos,
    convenios,
  ]);

  // Ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortPropuestas = (propuestas, config) => {
    if (!config.key) return propuestas;
    return [...propuestas].sort((a, b) => {
      let aValue, bValue;
      if (
        ["modalidad", "tipo", "estado", "area", "titulo", "convenio"].includes(
          config.key,
        )
      ) {
        // Usar helpers robustos
        switch (config.key) {
          case "modalidad":
            aValue = getModalidadNombre(a.id_modalidad).toLowerCase();
            bValue = getModalidadNombre(b.id_modalidad).toLowerCase();
            break;
          case "tipo":
            aValue = getTipoNombre(a.id_tipo_propuesta).toLowerCase();
            bValue = getTipoNombre(b.id_tipo_propuesta).toLowerCase();
            break;
          case "estado":
            aValue = getEstadoNombre(a.id_estado).toLowerCase();
            bValue = getEstadoNombre(b.id_estado).toLowerCase();
            break;
          case "area":
            aValue = getAreaNombre(a.id_area_conocimiento).toLowerCase();
            bValue = getAreaNombre(b.id_area_conocimiento).toLowerCase();
            break;
          case "titulo":
            aValue = getTituloNombre(a.id_titulo_certificacion).toLowerCase();
            bValue = getTituloNombre(b.id_titulo_certificacion).toLowerCase();
            break;
          case "convenio":
            aValue = getConvenioNombre(a.id_convenio).toLowerCase();
            bValue = getConvenioNombre(b.id_convenio).toLowerCase();
            break;
          default:
            aValue = "";
            bValue = "";
        }
      } else {
        aValue = (a[config.key] || "").toString().toLowerCase();
        bValue = (b[config.key] || "").toString().toLowerCase();
      }
      if (aValue < bValue) return config.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return config.direction === "asc" ? 1 : -1;
      return 0;
    });
  };
  const sortedPropuestas = sortPropuestas(filteredPropuestas, sortConfig);

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
          mobileVisiblePropuestas.length < filteredPropuestas.length
        ) {
          setMobilePage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [mobileVisiblePropuestas.length, filteredPropuestas.length],
  );

  // Modal crear/editar
  const openCreateModal = () => {
    setModalMode("crear");
    setCurrentPropuesta(initialPropuesta);
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };
  const openEditModal = (p) => {
    setModalMode("editar");
    setCurrentPropuesta({
      ...p,
      id_modalidad: p.id_modalidad || "",
      id_convenio: p.id_convenio || "",
      id_tipo_propuesta: p.id_tipo_propuesta || "",
      id_estado: p.id_estado || 1,
      id_area_conocimiento: p.id_area_conocimiento || "",
      id_titulo_certificacion: p.id_titulo_certificacion || "",
    });
    setModalOpen(true);
    setMessage(null);
    setValidationErrors({});
  };

  // Modal eliminar
  const openDeleteModal = (p) => {
    setPropuestaToDelete(p);
    setDeleteConfirmOpen(true);
  };

  // Validaciones del formulario
  const validateForm = () => {
    const errors = {};
    const nombreTrim = currentPropuesta.nombre.trim();

    if (!nombreTrim) {
      errors.nombre = "El nombre es obligatorio";
    } else if (nombreTrim.length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres";
    } else if (nombreTrim.length > 255) {
      errors.nombre = "El nombre no puede superar los 255 caracteres";
    } else {
      // validacion por si ya hay otra propuesta con el mismo nombre
      const normalize = (str) =>
        (str || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      const nombreNormalizado = normalize(nombreTrim);
      const existe = propuestas.some(
        (p) =>
          normalize(p.nombre) === nombreNormalizado &&
          // Permitir el mismo nombre si es el mismo registro, el que se esta editando
          (modalMode === "crear" || p.id !== currentPropuesta.id),
      );
      if (existe) {
        errors.nombre = "Ya existe una propuesta educativa con ese nombre";
      }
    }

    if (!currentPropuesta.duracion.trim()) {
      errors.duracion = "La duración es obligatoria";
    } else if (currentPropuesta.duracion.length > 255) {
      errors.duracion = "La duración no puede superar los 255 caracteres";
    }

    if (!currentPropuesta.titulo_otorgado.trim()) {
      errors.titulo_otorgado = "El título otorgado es obligatorio";
    } else if (currentPropuesta.titulo_otorgado.length > 255) {
      errors.titulo_otorgado =
        "El título otorgado no puede superar los 255 caracteres";
    }

    if (!currentPropuesta.requisitos_ingreso.trim()) {
      errors.requisitos_ingreso = "Requisitos de ingreso obligatorios";
    }

    if (!currentPropuesta.perfil_egresado.trim()) {
      errors.perfil_egresado = "Perfil de egresado obligatorio";
    }

    if (!currentPropuesta.salida_laboral.trim()) {
      errors.salida_laboral = "Salida laboral obligatoria";
    }

    if (!currentPropuesta.id_modalidad) {
      errors.id_modalidad = "La modalidad es obligatoria";
    }

    if (!currentPropuesta.id_tipo_propuesta) {
      errors.id_tipo_propuesta = "El tipo de propuesta es obligatorio";
    }

    if (!currentPropuesta.id_estado) {
      errors.id_estado = "El estado es obligatorio";
    }

    if (!currentPropuesta.id_area_conocimiento) {
      errors.id_area_conocimiento = "El área de conocimiento es obligatoria";
    }

    if (!currentPropuesta.id_titulo_certificacion) {
      errors.id_titulo_certificacion =
        "El título de certificación es obligatorio";
    }

    // Validación de descripción y observaciones (es opcional pero limitar longitud)
    if (
      currentPropuesta.descripcion &&
      currentPropuesta.descripcion.length > 500
    ) {
      errors.descripcion = "La descripción no puede superar los 500 caracteres";
    }
    if (
      currentPropuesta.observaciones &&
      currentPropuesta.observaciones.length > 500
    ) {
      errors.observaciones =
        "Las observaciones no pueden superar los 500 caracteres";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar propuesta
  const handleSave = async () => {
    if (!validateForm()) return;
    const { id, ...rest } = currentPropuesta;
    const data = {
      ...rest,
      id_modalidad: Number(rest.id_modalidad),
      id_convenio: rest.id_convenio ? Number(rest.id_convenio) : null,
      id_tipo_propuesta: Number(rest.id_tipo_propuesta),
      id_estado: Number(rest.id_estado),
      id_area_conocimiento: Number(rest.id_area_conocimiento),
      id_titulo_certificacion: Number(rest.id_titulo_certificacion),
    };
    try {
      if (modalMode === "crear") {
        const res = await axios.post(API_URL, data);
        const nuevoId = res.data.data.id;
        const detalle = await axios.get(`${API_URL}/${nuevoId}`);
        setPropuestas((prev) => [...prev, detalle.data.data]);
        setMessage("Propuesta educativa creada correctamente");
      } else {
        const res = await axios.put(`${API_URL}/${id}`, data);
        const actualizado = res.data.data;
        setPropuestas((prev) =>
          prev.map((c) => (c.id === id ? actualizado : c)),
        );
        setMessage("Propuesta educativa actualizada correctamente");
      }
      setModalOpen(false);
      setValidationErrors({});
    } catch (err) {
      alert(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        "Error al guardar la propuesta educativa. Verifica los datos e intenta de nuevo.",
      );
    }
  };

  // Eliminar propuesta
  const eliminarPropuesta = async () => {
    if (!propuestaToDelete) return;
    try {
      await axios.delete(`${API_URL}/${propuestaToDelete.id}`);
      setPropuestas((prev) =>
        prev.filter((c) => c.id !== propuestaToDelete.id),
      );
      setMessage("Propuesta educativa eliminada correctamente");
      setDeleteConfirmOpen(false);
      setPropuestaToDelete(null);
    } catch (err) {
      alert("Error al eliminar la propuesta educativa.");
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
                Gestor de Propuestas Educativas
              </h1>
              <p className="text-gray-600 text-center sm:text-left">
                Administra las propuestas educativas del sistema
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:items-center gap-2">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon />
                Nueva propuesta
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
              {filteredPropuestas.length} resultado
              {filteredPropuestas.length !== 1 ? "s" : ""} encontrado
              {filteredPropuestas.length !== 1 ? "s" : ""} para "{searchTerm}"
            </p>
          )}
        </div>

        {/* Tabla escritorio y cards mobile/tablet con loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando propuestas educativas...</p>
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
                onClick={fetchPropuestas}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : filteredPropuestas.length === 0 ? (
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
                    No se encontraron propuestas que coincidan con "{searchTerm}
                    "
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
                    No hay propuestas cargadas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza creando tu primera propuesta educativa
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Crear primera propuesta
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
                          onClick={() => handleSort("modalidad")}
                        >
                          Modalidad
                          {sortConfig.key === "modalidad" &&
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
                          onClick={() => handleSort("tipo")}
                        >
                          Tipo
                          {sortConfig.key === "tipo" &&
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
                      <div className="col-span-2 flex items-center h-full">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                          onClick={() => handleSort("area")}
                        >
                          Área
                          {sortConfig.key === "area" &&
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
                    {sortedPropuestas.map((p) => (
                      <div
                        key={p.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3">
                            <p className="font-medium text-gray-900">
                              {p.nombre}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">
                              {getModalidadNombre(p.id_modalidad) || "-"}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">
                              {getTipoNombre(p.id_tipo_propuesta) || "-"}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${(() => {
                                const estado = estados.find(
                                  (e) => e.id === p.id_estado,
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
                              {getEstadoNombre(p.id_estado) || "Sin estado"}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-700">
                              {getAreaNombre(p.id_area_conocimiento) || "-"}
                            </p>
                          </div>
                          <div className="col-span-1">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => setDetallePropuesta(p)}
                                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(p)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Editar"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => openDeleteModal(p)}
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
                {mobileVisiblePropuestas.map((p, idx) => {
                  const isLast = idx === mobileVisiblePropuestas.length - 1;
                  const estado = estados.find((e) => e.id === p.id_estado);
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
                      key={p.id}
                      ref={isLast ? lastCardRef : undefined}
                      className="bg-white rounded-lg shadow border px-4 py-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {p.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getModalidadNombre(p.id_modalidad)} -{" "}
                            {getTipoNombre(p.id_tipo_propuesta)}
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
                          <b>Área:</b>{" "}
                          {getAreaNombre(p.id_area_conocimiento) || "-"}
                        </span>
                        <span>
                          <b>Duración:</b> {p.duracion}
                        </span>
                      </div>
                      {p.descripcion && (
                        <div
                          className="text-xs text-gray-500 truncate"
                          title={p.descripcion}
                        >
                          <b>Desc:</b> {p.descripcion}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setDetallePropuesta(p)}
                          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Ver detalles"
                        >
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
                              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => openDeleteModal(p)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === "crear"
                    ? "Nueva Propuesta Educativa"
                    : "Editar Propuesta Educativa"}
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
                {/* Nombre */}
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.nombre ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                    value={currentPropuesta.nombre}
                    onChange={(e) => {
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        nombre: e.target.value,
                      });
                      if (validationErrors.nombre)
                        setValidationErrors((prev) => ({
                          ...prev,
                          nombre: "",
                        }));
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

                {/* Duración */}
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Duración <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.duracion ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                    value={currentPropuesta.duracion}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        duracion: e.target.value,
                      })
                    }
                    placeholder="Ej: 2 años"
                    maxLength={255}
                  />
                  {validationErrors.duracion && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.duracion}
                    </p>
                  )}
                </div>

                {/* Título otorgado */}
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Título otorgado <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.titulo_otorgado ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                    value={currentPropuesta.titulo_otorgado}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        titulo_otorgado: e.target.value,
                      })
                    }
                    placeholder="Título otorgado"
                    maxLength={255}
                  />
                  {validationErrors.titulo_otorgado && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.titulo_otorgado}
                    </p>
                  )}
                </div>

                {/* Modalidad */}
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Modalidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_modalidad"
                    value={currentPropuesta.id_modalidad}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        id_modalidad: e.target.value,
                      })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_modalidad ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                  >
                    <option value="" disabled>
                      Seleccionar modalidad
                    </option>
                    {modalidades.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                  {validationErrors.id_modalidad && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.id_modalidad}
                    </p>
                  )}
                </div>

                {/* Tipo de propuesta */}
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Tipo de propuesta <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_tipo_propuesta"
                    value={currentPropuesta.id_tipo_propuesta}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        id_tipo_propuesta: e.target.value,
                      })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_tipo_propuesta ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                  >
                    <option value="" disabled>
                      Seleccionar tipo
                    </option>
                    {tipos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                  {validationErrors.id_tipo_propuesta && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.id_tipo_propuesta}
                    </p>
                  )}
                </div>

                {/* Estado */}
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_estado"
                    value={currentPropuesta.id_estado}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        id_estado: e.target.value,
                      })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_estado ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                  >
                    <option value="" disabled>
                      Seleccionar estado
                    </option>
                    {Array.isArray(estados) &&
                      estados.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nombre}
                        </option>
                      ))}
                  </select>
                  {validationErrors.id_estado && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.id_estado}
                    </p>
                  )}
                </div>

                {/* Área de conocimiento */}
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Área de conocimiento <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_area_conocimiento"
                    value={currentPropuesta.id_area_conocimiento}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        id_area_conocimiento: e.target.value,
                      })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_area_conocimiento ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                  >
                    <option value="" disabled>
                      Seleccionar área
                    </option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                  {validationErrors.id_area_conocimiento && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.id_area_conocimiento}
                    </p>
                  )}
                </div>

                {/* Título de certificación */}
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Título de certificación{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_titulo_certificacion"
                    value={currentPropuesta.id_titulo_certificacion}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        id_titulo_certificacion: e.target.value,
                      })
                    }
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_titulo_certificacion ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                  >
                    <option value="" disabled>
                      Seleccionar título
                    </option>
                    {titulos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                  {validationErrors.id_titulo_certificacion && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.id_titulo_certificacion}
                    </p>
                  )}
                </div>

                {/* Convenio */}
                <div className="w-full md:w-[48%]">
                  <label className="block mb-2 font-medium text-gray-700">
                    Convenio
                  </label>
                  <select
                    name="id_convenio"
                    value={currentPropuesta.id_convenio}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        id_convenio: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  >
                    <option value="">Sin convenio</option>
                    {convenios.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div className="w-full">
                  <label className="block mb-2 font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.descripcion ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                    value={currentPropuesta.descripcion || ""}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        descripcion: e.target.value,
                      })
                    }
                    placeholder="Descripción"
                    maxLength={500}
                  />
                  {validationErrors.descripcion && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.descripcion}
                    </p>
                  )}
                </div>

                {/* Requisitos ingreso, perfil egresado, salida laboral */}
                {[
                  ["requisitos_ingreso", "Requisitos de ingreso"],
                  ["perfil_egresado", "Perfil de egresado"],
                  ["salida_laboral", "Salida laboral"],
                ].map(([field, label]) => (
                  <div key={field} className="w-full">
                    <label className="block mb-2 font-medium text-gray-700">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors[field]
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      value={currentPropuesta[field] || ""}
                      onChange={(e) =>
                        setCurrentPropuesta({
                          ...currentPropuesta,
                          [field]: e.target.value,
                        })
                      }
                      placeholder={label}
                    />
                    {validationErrors[field] && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors[field]}
                      </p>
                    )}
                  </div>
                ))}

                {/* Observaciones separada */}
                <div className="w-full">
                  <label className="block mb-2 font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500 resize-none"
                    value={currentPropuesta.observaciones || ""}
                    onChange={(e) =>
                      setCurrentPropuesta({
                        ...currentPropuesta,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Observaciones adicionales (opcional)"
                    maxLength={500}
                  />
                </div>
              </div>

              {/* Botones */}
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
      {detallePropuesta && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            // Solo cerrar si el click es en el backdrop y NO hay selección de texto
            if (
              e.target === e.currentTarget &&
              window.getSelection().isCollapsed
            ) {
              setDetallePropuesta(null);
            }
          }}
          style={{ userSelect: "auto" }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ scrollbarGutter: "stable" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalle de Propuesta Educativa
                </h2>
                <button
                  onClick={() => setDetallePropuesta(null)}
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
                  <b>Nombre:</b> {detallePropuesta.nombre}
                </div>
                <div>
                  <b>Descripción:</b>{" "}
                  <span className="break-words">
                    {detallePropuesta.descripcion || "-"}
                  </span>
                </div>
                <div>
                  <b>Duración:</b> {detallePropuesta.duracion}
                </div>
                <div>
                  <b>Título otorgado:</b> {detallePropuesta.titulo_otorgado}
                </div>
                <div>
                  <b>Requisitos de ingreso:</b>
                  <div className="break-words whitespace-pre-line max-h-32 overflow-y-auto">
                    {detallePropuesta.requisitos_ingreso}
                  </div>
                </div>
                <div>
                  <b>Perfil de egresado:</b>
                  <div className="break-words whitespace-pre-line max-h-32 overflow-y-auto">
                    {detallePropuesta.perfil_egresado}
                  </div>
                </div>
                <div>
                  <b>Salida laboral:</b>
                  <div className="break-words whitespace-pre-line max-h-32 overflow-y-auto">
                    {detallePropuesta.salida_laboral}
                  </div>
                </div>
                <div>
                  <b>Modalidad:</b>{" "}
                  {getModalidadNombre(detallePropuesta.id_modalidad) || "-"}
                </div>
                <div>
                  <b>Tipo de propuesta:</b>{" "}
                  {getTipoNombre(detallePropuesta.id_tipo_propuesta) || "-"}
                </div>
                <div>
                  <b>Estado:</b>{" "}
                  {getEstadoNombre(detallePropuesta.id_estado) || "-"}
                </div>
                <div>
                  <b>Área de conocimiento:</b>{" "}
                  {getAreaNombre(detallePropuesta.id_area_conocimiento) || "-"}
                </div>
                <div>
                  <b>Título de certificación:</b>{" "}
                  {getTituloNombre(detallePropuesta.id_titulo_certificacion) ||
                    "-"}
                </div>
                <div>
                  <b>Convenio:</b>{" "}
                  {detallePropuesta.id_convenio
                    ? getConvenioNombre(detallePropuesta.id_convenio) ||
                    `Convenio #${detallePropuesta.id_convenio}`
                    : "Sin convenio"}
                </div>
                <div>
                  <b>Observaciones:</b>
                  <div className="break-words whitespace-pre-line max-h-32 overflow-y-auto">
                    {detallePropuesta.observaciones || "-"}
                  </div>
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
                  ¿Estás seguro que querés eliminar la propuesta educativa:
                </p>
                <p className="font-semibold text-gray-900 mb-4">
                  "{propuestaToDelete?.nombre}"
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
                    onClick={eliminarPropuesta}
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

export default GestionPropuestaEducativa;