import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { Eye } from "lucide-react";


const API_URL = "http://localhost:5002/api/creus/api/cohorte";
const PROPUESTAS_URL = "http://localhost:5002/api/creus/api/propuestas";
const ESTADOS_URL = "http://localhost:5002/api/creus/api/estados";
const COORDINADORES_URL = "http://localhost:5002/api/creus/api/coordinador";
const SEDES_URL = "http://localhost:5002/api/creus/api/sede-creus";
const PAGE_SIZE = 10;

const initialCohorte = {
	id: null,
	id_propuesta_educativa: "",
	numero_cohorte: "",
	anio_inicio: "",
	mes_inicio: "",
	fecha_inicio_preinscripcion: "",
	fecha_cierre_preinscripcion: "",
	fecha_inicio_cursado: "",
	fecha_estimada_finalizacion: "",
	cupos_maximos: "",
	cupos_ocupados: 0,
	id_estado: "",
	id_coordinador: "",
	id_sede_creus: "",
	observaciones: "",
};

function formatDateInput(dateStr) {
	if (!dateStr) return "";
	return dateStr.slice(0, 10);
}

const GestionCohortes = () => {
	const [cohortes, setCohortes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [propuestas, setPropuestas] = useState([]);
	const [estados, setEstados] = useState([]);
	const [coordinadores, setCoordinadores] = useState([]);
	const [sedes, setSedes] = useState([]);

	const [searchTerm, setSearchTerm] = useState("");
	const [filteredCohortes, setFilteredCohortes] = useState([]);

	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("crear");
	const [currentCohorte, setCurrentCohorte] = useState(initialCohorte);

	const [detalleCohorte, setDetalleCohorte] = useState(null);

	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [cohorteToDelete, setCohorteToDelete] = useState(null);

	const [message, setMessage] = useState(null);
	const [validationErrors, setValidationErrors] = useState({});

	const [mobilePage, setMobilePage] = useState(1);
	const observer = useRef();
	const mobileVisibleCohortes = filteredCohortes.slice(0, mobilePage * PAGE_SIZE);

	// Cargar datos
	useEffect(() => {
		fetchCohortes();
		fetchPropuestas();
		fetchEstados();
		fetchCoordinadores();
		fetchSedes();
	}, []);

	const fetchCohortes = async () => {
		setLoading(true);
		try {
			const res = await axios.get(API_URL);
			setCohortes(Array.isArray(res.data.data) ? res.data.data : []);
			setError(null);
		} catch {
			setError("Error al cargar las cohortes.");
		} finally {
			setLoading(false);
		}
	};

	const fetchPropuestas = async () => {
		try {
			const res = await axios.get(PROPUESTAS_URL);
			setPropuestas(Array.isArray(res.data.data) ? res.data.data : []);
		} catch {
			setPropuestas([]);
		}
	};

	const fetchEstados = async () => {
		try {
			const res = await axios.get(ESTADOS_URL);
			if (Array.isArray(res.data)) setEstados(res.data);
			else if (Array.isArray(res.data.data)) setEstados(res.data.data);
			else if (Array.isArray(res.data.message)) setEstados(res.data.message);
			else setEstados([]);
		} catch {
			setEstados([]);
		}
	};

	const fetchCoordinadores = async () => {
		try {
			const res = await axios.get(COORDINADORES_URL);
			setCoordinadores(Array.isArray(res.data.data) ? res.data.data : []);
		} catch {
			setCoordinadores([]);
		}
	};

	const fetchSedes = async () => {
		try {
			const res = await axios.get(SEDES_URL);
			setSedes(Array.isArray(res.data.data) ? res.data.data : []);
		} catch {
			setSedes([]);
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
			setFilteredCohortes(cohortes);
		} else {
			const normalizedSearch = normalize(searchTerm);
			setFilteredCohortes(
				cohortes.filter((c) => {
					const propuestaNombre = getPropuestaNombre(c.id_propuesta_educativa).toLowerCase();
					const estadoNombre = getEstadoNombre(c.id_estado).toLowerCase();
					const coordinadorNombre = getCoordinadorNombre(c.id_coordinador).toLowerCase();
					const sedeNombre = getSedeNombre(c.id_sede_creus).toLowerCase();
					return (
						normalize(c.numero_cohorte.toString()).includes(normalizedSearch) ||
						normalize(c.anio_inicio.toString()).includes(normalizedSearch) ||
						normalize(c.mes_inicio).includes(normalizedSearch) ||
						propuestaNombre.includes(normalizedSearch) ||
						estadoNombre.includes(normalizedSearch) ||
						coordinadorNombre.includes(normalizedSearch) ||
						sedeNombre.includes(normalizedSearch)
					);
				})
			);
		}
	}, [cohortes, searchTerm, propuestas, estados, coordinadores, sedes]);

	// Helpers para mostrar nombres
	const getPropuestaNombre = (id) => propuestas.find((p) => p.id === id)?.nombre || "-";
	const getEstadoNombre = (id) => estados.find((e) => e.id === id)?.nombre || "-";
	const getCoordinadorNombre = (id) => coordinadores.find((c) => c.id === id)?.nombre || "-";
	const getSedeNombre = (id) => sedes.find((s) => s.id === id)?.nombre || "-";

	// Ordenamiento
	const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
	const sortCohortes = (cohortes, config) => {
		if (!config.key) return cohortes;
		return [...cohortes].sort((a, b) => {
			let aValue, bValue;
			if (config.key === "propuesta") {
				aValue = getPropuestaNombre(a.id_propuesta_educativa).toLowerCase();
				bValue = getPropuestaNombre(b.id_propuesta_educativa).toLowerCase();
			} else if (config.key === "estado") {
				aValue = getEstadoNombre(a.id_estado).toLowerCase();
				bValue = getEstadoNombre(b.id_estado).toLowerCase();
			} else if (config.key === "coordinador") {
				aValue = getCoordinadorNombre(a.id_coordinador).toLowerCase();
				bValue = getCoordinadorNombre(b.id_coordinador).toLowerCase();
			} else if (config.key === "sede") {
				aValue = getSedeNombre(a.id_sede_creus).toLowerCase();
				bValue = getSedeNombre(b.id_sede_creus).toLowerCase();
			} else {
				aValue = (a[config.key] || "").toString().toLowerCase();
				bValue = (b[config.key] || "").toString().toLowerCase();
			}
			if (aValue < bValue) return config.direction === "asc" ? -1 : 1;
			if (aValue > bValue) return config.direction === "asc" ? 1 : -1;
			return 0;
		});
	};
	const sortedCohortes = sortCohortes(filteredCohortes, sortConfig);

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
					mobileVisibleCohortes.length < filteredCohortes.length
				) {
					setMobilePage((prev) => prev + 1);
				}
			});
			if (node) observer.current.observe(node);
		},
		[mobileVisibleCohortes.length, filteredCohortes.length]
	);

	// Modal crear/editar
	const openCreateModal = () => {
		setModalMode("crear");
		setCurrentCohorte(initialCohorte);
		setModalOpen(true);
		setMessage(null);
		setValidationErrors({});
	};

	const openEditModal = (cohorte) => {
		setModalMode("editar");
		setCurrentCohorte({
			...cohorte,
			fecha_inicio_preinscripcion: formatDateInput(cohorte.fecha_inicio_preinscripcion),
			fecha_cierre_preinscripcion: formatDateInput(cohorte.fecha_cierre_preinscripcion),
			fecha_inicio_cursado: formatDateInput(cohorte.fecha_inicio_cursado),
			fecha_estimada_finalizacion: formatDateInput(cohorte.fecha_estimada_finalizacion),
		});
		setModalOpen(true);
		setMessage(null);
		setValidationErrors({});
	};

	// Modal eliminar
	const openDeleteModal = (cohorte) => {
		setCohorteToDelete(cohorte);
		setDeleteConfirmOpen(true);
	};

	// Validaciones de formulario (puedes expandir según tu lógica)
	const validateForm = () => {
		const errors = {};
		if (!currentCohorte.id_propuesta_educativa) errors.id_propuesta_educativa = "Campo obligatorio";
		if (!currentCohorte.numero_cohorte) errors.numero_cohorte = "Campo obligatorio";
		if (!currentCohorte.anio_inicio) errors.anio_inicio = "Campo obligatorio";
		if (!currentCohorte.mes_inicio) errors.mes_inicio = "Campo obligatorio";
		if (!currentCohorte.fecha_inicio_preinscripcion) errors.fecha_inicio_preinscripcion = "Campo obligatorio";
		if (!currentCohorte.fecha_cierre_preinscripcion) errors.fecha_cierre_preinscripcion = "Campo obligatorio";
		if (!currentCohorte.fecha_inicio_cursado) errors.fecha_inicio_cursado = "Campo obligatorio";
		if (!currentCohorte.fecha_estimada_finalizacion) errors.fecha_estimada_finalizacion = "Campo obligatorio";
		if (!currentCohorte.cupos_maximos) errors.cupos_maximos = "Campo obligatorio";
		if (currentCohorte.cupos_ocupados > currentCohorte.cupos_maximos) errors.cupos_ocupados = "No puede superar los cupos máximos";
		if (!currentCohorte.id_estado) errors.id_estado = "Campo obligatorio";
		if (!currentCohorte.id_coordinador) errors.id_coordinador = "Campo obligatorio";
		if (!currentCohorte.id_sede_creus) errors.id_sede_creus = "Campo obligatorio";
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Guardar cohorte
	const handleSave = async () => {
		if (!validateForm()) return;
		const { id, ...rest } = currentCohorte;
		const data = {
			...rest,
			id_propuesta_educativa: Number(rest.id_propuesta_educativa),
			numero_cohorte: Number(rest.numero_cohorte),
			anio_inicio: Number(rest.anio_inicio),
			cupos_maximos: Number(rest.cupos_maximos),
			cupos_ocupados: Number(rest.cupos_ocupados),
			id_estado: Number(rest.id_estado),
			id_coordinador: Number(rest.id_coordinador),
			id_sede_creus: Number(rest.id_sede_creus),
		};
		try {
			if (modalMode === "crear") {
				const res = await axios.post(API_URL, data);
				const nuevoId = res.data.data.id;
				const detalle = await axios.get(`${API_URL}/${nuevoId}`);
				setCohortes((prev) => [...prev, detalle.data.data]);
				setMessage("Cohorte creada correctamente");
			} else {
				const res = await axios.put(`${API_URL}/${id}`, data);
				const actualizado = res.data.data;
				setCohortes((prev) => prev.map((c) => (c.id === id ? actualizado : c)));
				setMessage("Cohorte actualizada correctamente");
			}
			setModalOpen(false);
			setValidationErrors({});
		} catch (err) {
			alert(
				err.response?.data?.message ||
				JSON.stringify(err.response?.data) ||
				err.message ||
				"Error al guardar la cohorte. Verifica los datos e intenta de nuevo."
			);
		}
	};

	// Eliminar cohorte
	const eliminarCohorte = async () => {
		if (!cohorteToDelete) return;
		try {
			await axios.delete(`${API_URL}/${cohorteToDelete.id}`);
			setCohortes((prev) => prev.filter((c) => c.id !== cohorteToDelete.id));
			setMessage("Cohorte eliminada correctamente");
			setDeleteConfirmOpen(false);
			setCohorteToDelete(null);
		} catch (err) {
			alert("Error al eliminar la cohorte.");
		}
	};

	// Limpiar búsqueda
	const clearSearch = () => setSearchTerm("");

	// Mensaje de éxito que desaparece
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

	return (
		<AdminLayout>
			<div className="p-6 h-full flex flex-col">
				{/* Título, botón y búsqueda */}
				<div className="flex-shrink-0 mb-6">
					<div className="flex flex-col items-center sm:flex-row sm:justify-between mb-2 gap-4">
						<div className="flex-1 w-full">
							<h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left mb-1">
								Gestor de Cohortes
							</h1>
							<p className="text-gray-600 text-center sm:text-left">
								Administra las cohortes del sistema
							</p>
						</div>
						<div className="w-full sm:w-auto flex justify-center sm:justify-end sm:items-center gap-2">
							<button
								onClick={openCreateModal}
								className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
							>
								<PlusIcon />
								Nueva cohorte
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
							{filteredCohortes.length} resultado
							{filteredCohortes.length !== 1 ? "s" : ""} encontrado
							{filteredCohortes.length !== 1 ? "s" : ""} para "{searchTerm}"
						</p>
					)}
				</div>

				{/* Tabla escritorio y cards mobile/tablet con loading */}
				{loading ? (
					<div className="flex flex-col items-center justify-center h-full">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
						<p className="text-gray-600">Cargando cohortes...</p>
					</div>
				) : error ? (
					<div className="flex flex-col items-center justify-center h-full">
						<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
							<svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<p className="text-red-600 font-medium">{error}</p>
							<button
								onClick={fetchCohortes}
								className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
							>
								Reintentar
							</button>
						</div>
					</div>
				) : filteredCohortes.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full">
						<div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-md text-center">
							{searchTerm ? (
								<>
									<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Sin resultados
									</h3>
									<p className="text-gray-600 mb-4">
										No se encontraron cohortes que coincidan con "{searchTerm}"
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
									<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										No hay cohortes cargadas
									</h3>
									<p className="text-gray-600 mb-4">
										Comienza creando tu primera cohorte
									</p>
									<button
										onClick={openCreateModal}
										className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
									>
										Crear primera cohorte
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
								{/* Encabezado */}
								<div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 rounded-t-lg">
									<div className="px-6 py-3">
										<div className="grid grid-cols-10 gap-4">
											<div className="col-span-2 flex items-center h-full">
												<button
													type="button"
													className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
													onClick={() => handleSort("propuesta")}
												>
													Propuesta
													{sortConfig.key === "propuesta" &&
														(sortConfig.direction === "asc" ? <span>&uarr;</span> : <span>&darr;</span>)}
												</button>
											</div>
											<div className="col-span-1 flex items-center h-full">
												<button
													type="button"
													className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
													onClick={() => handleSort("numero_cohorte")}
												>
													N°
													{sortConfig.key === "numero_cohorte" &&
														(sortConfig.direction === "asc" ? <span>&uarr;</span> : <span>&darr;</span>)}
												</button>
											</div>
											<div className="col-span-2 flex items-center h-full">
												<span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
													Fechas
												</span>
											</div>
											<div className="col-span-1 flex items-center h-full">
												<span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
													Cupos
												</span>
											</div>
											<div className="col-span-1 flex items-center h-full">
												<button
													type="button"
													className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
													onClick={() => handleSort("estado")}
												>
													Estado
													{sortConfig.key === "estado" &&
														(sortConfig.direction === "asc" ? <span>&uarr;</span> : <span>&darr;</span>)}
												</button>
											</div>
											<div className="col-span-1 flex items-center h-full">
												<button
													type="button"
													className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
													onClick={() => handleSort("coordinador")}
												>
													Coord.
													{sortConfig.key === "coordinador" &&
														(sortConfig.direction === "asc" ? <span>&uarr;</span> : <span>&darr;</span>)}
												</button>
											</div>
											<div className="col-span-1 flex items-center h-full">
												<button
													type="button"
													className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
													onClick={() => handleSort("sede")}
												>
													Sede
													{sortConfig.key === "sede" &&
														(sortConfig.direction === "asc" ? <span>&uarr;</span> : <span>&darr;</span>)}
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
								<div className="flex-1 overflow-y-auto max-h-[60vh]">
									<div className="divide-y divide-gray-200 pb-4">
										{sortedCohortes.map((c) => (
											<div key={c.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
												<div className="grid grid-cols-10 gap-4 items-center">
													<div className="col-span-2">{getPropuestaNombre(c.id_propuesta_educativa)}</div>
													<div className="col-span-1">{c.numero_cohorte}</div>
													<div className="col-span-2">
														<span className="block text-xs">
															Preinscripción: {c.fecha_inicio_preinscripcion?.slice(0, 10)} a {c.fecha_cierre_preinscripcion?.slice(0, 10)}
														</span>
														<span className="block text-xs">
															Cursado: {c.fecha_inicio_cursado?.slice(0, 10)} a {c.fecha_estimada_finalizacion?.slice(0, 10)}
														</span>
													</div>
													<div className="col-span-1">
														<span className="block text-xs">
															{c.cupos_ocupados}/{c.cupos_maximos}
														</span>
													</div>
													<div className="col-span-1">
														<span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${(() => {
																const estado = estados.find(e => e.id === c.id_estado);
																if (!estado) return "bg-gray-200 text-gray-700";
																if (estado.nombre?.toLowerCase() === "pendiente") return "bg-yellow-100 text-yellow-800";
																if (estado.nombre?.toLowerCase() === "finalizado") return "bg-blue-100 text-blue-800";
																if (estado.activo) return "bg-green-100 text-green-800";
																return "bg-gray-200 text-gray-700";
															})()
															}`}>
															{getEstadoNombre(c.id_estado)}
														</span>
													</div>
													<div className="col-span-1">{getCoordinadorNombre(c.id_coordinador)}</div>
													<div className="col-span-1">{getSedeNombre(c.id_sede_creus)}</div>
													<div className="col-span-1">
														<div className="flex justify-center space-x-2">
															<button
																onClick={() => setDetalleCohorte(c)}
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
								{mobileVisibleCohortes.map((c, idx) => {
									const isLast = idx === mobileVisibleCohortes.length - 1;
									return (
										<div
											key={c.id}
											ref={isLast ? lastCardRef : undefined}
											className="bg-white rounded-lg shadow border px-4 py-4 flex flex-col gap-2"
										>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-semibold text-gray-900">
														{getPropuestaNombre(c.id_propuesta_educativa)}
													</p>
													<p className="text-xs text-gray-500">
														Cohorte N° {c.numero_cohorte} - {c.anio_inicio}
													</p>
												</div>
												<span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${(() => {
													const estado = estados.find(e => e.id === c.id_estado);
													if (!estado) return "bg-gray-200 text-gray-700";
													if (estado.nombre?.toLowerCase() === "pendiente") return "bg-yellow-100 text-yellow-800";
													if (estado.nombre?.toLowerCase() === "finalizado") return "bg-blue-100 text-blue-800";
													if (estado.activo) return "bg-green-100 text-green-800";
													return "bg-gray-200 text-gray-700";
												})()
													}`}>
													{getEstadoNombre(c.id_estado)}
												</span>
											</div>
											<div className="flex flex-wrap gap-2 text-xs text-gray-700">
												<span>
													<b>Coordinador:</b> {getCoordinadorNombre(c.id_coordinador)}
												</span>
												<span>
													<b>Sede:</b> {getSedeNombre(c.id_sede_creus)}
												</span>
												<span>
													<b>Cupos:</b> {c.cupos_ocupados}/{c.cupos_maximos}
												</span>
											</div>
											<div className="flex justify-end gap-2 mt-2">
												<button
													onClick={() => setDetalleCohorte(c)}
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
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-gray-900">
									{modalMode === "crear" ? "Nueva Cohorte" : "Editar Cohorte"}
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
							<div className="flex flex-wrap gap-4">
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Propuesta educativa <span className="text-red-500">*</span>
									</label>
									<select
										name="id_propuesta_educativa"
										value={currentCohorte.id_propuesta_educativa}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												id_propuesta_educativa: e.target.value,
											})
										}
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_propuesta_educativa ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
									>
										<option value="" disabled>
											Seleccionar propuesta
										</option>
										{propuestas.map((p) => (
											<option key={p.id} value={p.id}>
												{p.nombre}
											</option>
										))}
									</select>
									{validationErrors.id_propuesta_educativa && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.id_propuesta_educativa}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										N° Cohorte <span className="text-red-500">*</span>
									</label>
									<input
										type="number"
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.numero_cohorte ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
										value={currentCohorte.numero_cohorte}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												numero_cohorte: e.target.value,
											})
										}
										placeholder="Ej: 1"
									/>
									{validationErrors.numero_cohorte && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.numero_cohorte}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Año de inicio <span className="text-red-500">*</span>
									</label>
									<input
										type="number"
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.anio_inicio ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
										value={currentCohorte.anio_inicio}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												anio_inicio: e.target.value,
											})
										}
										placeholder="Ej: 2025"
									/>
									{validationErrors.anio_inicio && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.anio_inicio}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Mes de inicio <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.mes_inicio ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
										value={currentCohorte.mes_inicio}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												mes_inicio: e.target.value,
											})
										}
										placeholder="Ej: Marzo"
									/>
									{validationErrors.mes_inicio && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.mes_inicio}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Fecha inicio preinscripción <span className="text-red-500">*</span>
									</label>
									<input
										type="date"
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.fecha_inicio_preinscripcion ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
										value={currentCohorte.fecha_inicio_preinscripcion}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												fecha_inicio_preinscripcion: e.target.value,
											})
										}
									/>
									{validationErrors.fecha_inicio_preinscripcion && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.fecha_inicio_preinscripcion}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Fecha cierre preinscripción <span className="text-red-500">*</span>
									</label>
									<input
										type="date"
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.fecha_cierre_preinscripcion ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
										value={currentCohorte.fecha_cierre_preinscripcion}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												fecha_cierre_preinscripcion: e.target.value,
											})
										}
									/>
									{validationErrors.fecha_cierre_preinscripcion && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.fecha_cierre_preinscripcion}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Fecha inicio cursado <span className="text-red-500">*</span>
									</label>
									<input
										type="date"
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.fecha_inicio_cursado ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
										value={currentCohorte.fecha_inicio_cursado}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												fecha_inicio_cursado: e.target.value,
											})
										}
									/>
									{validationErrors.fecha_inicio_cursado && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.fecha_inicio_cursado}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Fecha estimada finalización <span className="text-red-500">*</span>
									</label>
									<input
										type="date"
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.fecha_estimada_finalizacion ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
										value={currentCohorte.fecha_estimada_finalizacion}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												fecha_estimada_finalizacion: e.target.value,
											})
										}
									/>
									{validationErrors.fecha_estimada_finalizacion && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.fecha_estimada_finalizacion}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Cupos máximos <span className="text-red-500">*</span>
									</label>
									<input
										type="number"
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.cupos_maximos ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
										value={currentCohorte.cupos_maximos}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												cupos_maximos: e.target.value,
											})
										}
										placeholder="Ej: 30"
									/>
									{validationErrors.cupos_maximos && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.cupos_maximos}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Cupos ocupados
									</label>
									<input
										type="number"
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.cupos_ocupados ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
										value={currentCohorte.cupos_ocupados}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												cupos_ocupados: e.target.value,
											})
										}
										placeholder="Ej: 0"
									/>
									{validationErrors.cupos_ocupados && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.cupos_ocupados}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Estado <span className="text-red-500">*</span>
									</label>
									<select
										name="id_estado"
										value={currentCohorte.id_estado}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												id_estado: e.target.value,
											})
										}
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_estado ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
									>
										<option value="" disabled>
											Seleccionar estado
										</option>
										{estados
											.filter(
												(e) =>
													e.nombre?.toLowerCase() === "activo" ||
													e.nombre?.toLowerCase() === "inactivo"
											)
											.map((e) => (
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
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Coordinador <span className="text-red-500">*</span>
									</label>
									<select
										name="id_coordinador"
										value={currentCohorte.id_coordinador}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												id_coordinador: e.target.value,
											})
										}
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_coordinador ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
									>
										<option value="" disabled>
											Seleccionar coordinador
										</option>
										{coordinadores.map((c) => (
											<option key={c.id} value={c.id}>
												{c.nombre}
											</option>
										))}
									</select>
									{validationErrors.id_coordinador && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.id_coordinador}
										</p>
									)}
								</div>
								<div className="w-full md:w-[48%]">
									<label className="block mb-2 font-medium text-gray-700">
										Sede CREUS <span className="text-red-500">*</span>
									</label>
									<select
										name="id_sede_creus"
										value={currentCohorte.id_sede_creus}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
												id_sede_creus: e.target.value,
											})
										}
										className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${validationErrors.id_sede_creus ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
									>
										<option value="" disabled>
											Seleccionar sede
										</option>
										{sedes.map((s) => (
											<option key={s.id} value={s.id}>
												{s.nombre}
											</option>
										))}
									</select>
									{validationErrors.id_sede_creus && (
										<p className="mt-1 text-sm text-red-600">
											{validationErrors.id_sede_creus}
										</p>
									)}
								</div>
								<div className="w-full">
									<label className="block mb-2 font-medium text-gray-700">
										Observaciones
									</label>
									<textarea
										rows={2}
										className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500 resize-none"
										value={currentCohorte.observaciones || ""}
										onChange={(e) =>
											setCurrentCohorte({
												...currentCohorte,
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
			{detalleCohorte && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
					onMouseDown={(e) => {
						if (
							e.target === e.currentTarget &&
							window.getSelection().isCollapsed
						) {
							setDetalleCohorte(null);
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
									Detalle de Cohorte
								</h2>
								<button
									onClick={() => setDetalleCohorte(null)}
									className="text-gray-400 hover:text-gray-600 p-1"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							<div className="space-y-2 text-sm">
								<div>
									<b>Propuesta:</b> {getPropuestaNombre(detalleCohorte.id_propuesta_educativa)}
								</div>
								<div>
									<b>N° Cohorte:</b> {detalleCohorte.numero_cohorte}
								</div>
								<div>
									<b>Año de inicio:</b> {detalleCohorte.anio_inicio}
								</div>
								<div>
									<b>Mes de inicio:</b> {detalleCohorte.mes_inicio}
								</div>
								<div>
									<b>Fechas:</b>
									<div className="break-words whitespace-pre-line max-h-32 overflow-y-auto">
										Preinscripción: {detalleCohorte.fecha_inicio_preinscripcion?.slice(0, 10)} a {detalleCohorte.fecha_cierre_preinscripcion?.slice(0, 10)}
										<br />
										Cursado: {detalleCohorte.fecha_inicio_cursado?.slice(0, 10)} a {detalleCohorte.fecha_estimada_finalizacion?.slice(0, 10)}
									</div>
								</div>
								<div>
									<b>Cupos:</b> {detalleCohorte.cupos_ocupados}/{detalleCohorte.cupos_maximos}
								</div>
								<div>
									<b>Estado:</b> {getEstadoNombre(detalleCohorte.id_estado)}
								</div>
								<div>
									<b>Coordinador:</b> {getCoordinadorNombre(detalleCohorte.id_coordinador)}
								</div>
								<div>
									<b>Sede CREUS:</b> {getSedeNombre(detalleCohorte.id_sede_creus)}
								</div>
								<div>
									<b>Observaciones:</b> {detalleCohorte.observaciones || "-"}
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
									<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</div>
							</div>
							<div className="text-center">
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									Confirmar eliminación
								</h3>
								<p className="text-gray-600 mb-2">
									¿Estás seguro que querés eliminar la cohorte:
								</p>
								<p className="font-semibold text-gray-900 mb-4">
									Cohorte N° {cohorteToDelete?.numero_cohorte} - {getPropuestaNombre(cohorteToDelete?.id_propuesta_educativa)}
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
										onClick={eliminarCohorte}
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

export default GestionCohortes;