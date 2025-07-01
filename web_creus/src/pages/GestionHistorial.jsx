import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';

const API_URL = 'http://localhost:5002/api/creus/api/historial';
const PAGE_SIZE = 10;

const GestionHistorial = () => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Búsqueda y filtrado
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredHistorial, setFilteredHistorial] = useState([]);
    const [filterUsuario, setFilterUsuario] = useState('');
    const [filterTabla, setFilterTabla] = useState('');

    // Responsive: paginación para móvil/tablet
    const [mobilePage, setMobilePage] = useState(1);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const observer = useRef();
    const mobileVisibleHistorial = filteredHistorial.slice(0, mobilePage * PAGE_SIZE);

    // Ordenamiento
    const [sortConfig, setSortConfig] = useState({ key: 'fecha_hora', direction: 'desc' });

    // Normalizar texto para búsqueda
    const normalize = (str) =>
        (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Cargar historial
    useEffect(() => {
        fetchHistorial();
    }, []);

    const fetchHistorial = async () => {
        setLoading(true);
        try {
            let url = API_URL + '/';
            if (filterUsuario) url = `${API_URL}/usuario/${filterUsuario}`;
            else if (filterTabla) url = `${API_URL}/tabla/${filterTabla}`;
            const res = await axios.get(url);
            // Acepta array en data, message, o el propio res.data
            const historialArr = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.data)
                    ? res.data.data
                    : Array.isArray(res.data.message)
                        ? res.data.message
                        : [];
            setHistorial(historialArr);
            setError(null);
        } catch {
            setError('Error al cargar el historial.');
        } finally {
            setLoading(false);
        }
    };

    // Filtrado por búsqueda
    useEffect(() => {
        let data = historial;
        if (searchTerm.trim()) {
            const normalizedSearch = normalize(searchTerm);
            data = data.filter(item =>
                normalize(item.nombre_tabla).includes(normalizedSearch) ||
                (item.accion && normalize(item.accion).includes(normalizedSearch)) ||
                (item.observaciones && normalize(item.observaciones).includes(normalizedSearch)) ||
                (item.id_usuario && item.id_usuario.toString().includes(normalizedSearch)) ||
                (item.id_registro && item.id_registro.toString().includes(normalizedSearch))
            );
        }
        setFilteredHistorial(data);
        setMobilePage(1);
    }, [historial, searchTerm]);

    // Ordenamiento
    const sortHistorial = (items, config) => {
        if (!config.key) return items;
        return [...items].sort((a, b) => {
            let aValue = a[config.key];
            let bValue = b[config.key];
            if (aValue === null || aValue === undefined) aValue = '';
            if (bValue === null || bValue === undefined) bValue = '';
            if (config.key === 'fecha_hora') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else {
                aValue = aValue.toString().toLowerCase();
                bValue = bValue.toString().toLowerCase();
            }
            if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const sortedHistorial = sortHistorial(filteredHistorial, sortConfig);

    // Ordenar columnas
    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    // Infinite scroll para móvil
    const lastCardRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new window.IntersectionObserver(entries => {
            if (entries[0].isIntersecting && mobileVisibleHistorial.length < filteredHistorial.length) {
                setMobilePage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [mobileVisibleHistorial.length, filteredHistorial.length]);

    // Limpiar búsqueda
    const clearSearch = () => setSearchTerm('');

    // Limpiar filtros
    const clearFilters = () => {
        setFilterUsuario('');
        setFilterTabla('');
    };

    // Recargar historial al cambiar filtros
    useEffect(() => {
        fetchHistorial();
    }, [filterUsuario, filterTabla]);

    // Iconos
    const SearchIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
    const ClearIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    return (
        <AdminLayout>
            <div className="p-6 h-full flex flex-col">
                <div className="flex-shrink-0 mb-6">
                    <div className="flex flex-col items-center sm:flex-row sm:justify-between mb-2 gap-4">
                        <div className="flex-1 w-full">
                            <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left mb-1">
                                Gestor de Historial
                            </h1>
                            <p className="text-gray-600 text-center sm:text-left">
                                Visualizá los registros de acciones realizadas en el sistema
                            </p>
                        </div>
                    </div>
                    {/* Mensaje de error */}
                    {error && (
                        <div className="mb-4">
                            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Barra de búsqueda */}
                {(showMobileSearch || window.innerWidth >= 640) && (
                    <div className={`mb-4 mt-0 sm:mt-0 transition-all duration-200 ${showMobileSearch ? '' : 'sm:block hidden'}`}>
                        <div className="w-full sm:w-full px-0">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar en historial"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
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
                                    {filteredHistorial.length} resultado{filteredHistorial.length !== 1 ? 's' : ''} encontrado{filteredHistorial.length !== 1 ? 's' : ''} para "{searchTerm}"
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabla o cards */}
                <div className="flex-1 min-h-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-600">Cargando historial...</p>
                        </div>
                    ) : filteredHistorial.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-md text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
                                <p className="text-gray-600 mb-4">No se encontraron registros en el historial</p>
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
                                                <div className="col-span-1 flex items-center h-full">
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                                                        onClick={() => handleSort('id')}
                                                    >
                                                        ID
                                                        {sortConfig.key === 'id' && (
                                                            sortConfig.direction === 'asc' ? <span>&uarr;</span> : <span>&darr;</span>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="col-span-2 flex items-center h-full">
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                                                        onClick={() => handleSort('fecha_hora')}
                                                    >
                                                        Fecha y Hora
                                                        {sortConfig.key === 'fecha_hora' && (
                                                            sortConfig.direction === 'asc' ? <span>&uarr;</span> : <span>&darr;</span>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="col-span-2 flex items-center h-full">
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                                                        onClick={() => handleSort('nombre_tabla')}
                                                    >
                                                        Tabla
                                                        {sortConfig.key === 'nombre_tabla' && (
                                                            sortConfig.direction === 'asc' ? <span>&uarr;</span> : <span>&darr;</span>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="col-span-1 flex items-center h-full">
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                                                        onClick={() => handleSort('accion')}
                                                    >
                                                        Acción
                                                        {sortConfig.key === 'accion' && (
                                                            sortConfig.direction === 'asc' ? <span>&uarr;</span> : <span>&darr;</span>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="col-span-2 flex items-center h-full">
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                                                        onClick={() => handleSort('id_usuario')}
                                                    >
                                                        Usuario
                                                        {sortConfig.key === 'id_usuario' && (
                                                            sortConfig.direction === 'asc' ? <span>&uarr;</span> : <span>&darr;</span>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="col-span-1 flex items-center h-full">
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider focus:outline-none"
                                                        onClick={() => handleSort('id_registro')}
                                                    >
                                                        ID Registro
                                                        {sortConfig.key === 'id_registro' && (
                                                            sortConfig.direction === 'asc' ? <span>&uarr;</span> : <span>&darr;</span>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="col-span-3 flex items-center h-full">
                                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Observaciones</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="divide-y divide-gray-200">
                                            {sortedHistorial.map(item => (
                                                <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                                    <div className="grid grid-cols-12 gap-4 items-start">
                                                        <div className="col-span-1">
                                                            <p className="font-medium text-gray-900">{item.id}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-gray-700 text-sm">{new Date(item.fecha_hora).toLocaleString()}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-gray-700 text-sm">{item.nombre_tabla}</p>
                                                        </div>
                                                        <div className="col-span-1">
                                                            <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">{item.accion}</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-gray-700 text-sm">{item.id_usuario ?? <span className="text-gray-400 italic">-</span>}</p>
                                                        </div>
                                                        <div className="col-span-1">
                                                            <p className="text-gray-700 text-sm">{item.id_registro ?? <span className="text-gray-400 italic">-</span>}</p>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{item.observaciones || <span className="text-gray-400 italic">Sin observaciones</span>}</p>
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
                                <div className="space-y-4 pb-24">
                                    {mobileVisibleHistorial.map((item, idx) => {
                                        const isLast = idx === mobileVisibleHistorial.length - 1;
                                        return (
                                            <div
                                                key={item.id}
                                                ref={isLast ? lastCardRef : undefined}
                                                className="bg-white rounded-lg shadow border"
                                            >
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="font-semibold text-gray-900">#{item.id}</span>
                                                            <span className="ml-2 text-xs text-gray-500">{new Date(item.fecha_hora).toLocaleString()}</span>
                                                        </div>
                                                        <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">{item.accion}</span>
                                                    </div>
                                                    <div className="mb-1">
                                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tabla: </span>
                                                        <span className="text-gray-700">{item.nombre_tabla}</span>
                                                    </div>
                                                    <div className="mb-1">
                                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario: </span>
                                                        <span className="text-gray-700">{item.id_usuario ?? <span className="text-gray-400 italic">-</span>}</span>
                                                    </div>
                                                    <div className="mb-1">
                                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID Registro: </span>
                                                        <span className="text-gray-700">{item.id_registro ?? <span className="text-gray-400 italic">-</span>}</span>
                                                    </div>
                                                    <div className="border-t pt-2 mt-2">
                                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones:</span>
                                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                                            {item.observaciones || <span className="text-gray-400 italic">Sin observaciones</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {mobileVisibleHistorial.length >= filteredHistorial.length && (
                                        <div className="text-center text-gray-400 text-xs pb-4">
                                            Fin de la lista
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default GestionHistorial;