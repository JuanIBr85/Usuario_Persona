import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const API_URL = 'http://localhost:5002/api/creus/api/preinscripcion';
const PAGE_SIZE = 10;

const GestionPreinscripcion = () => {
    const [preinscripciones, setPreinscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPreinscripciones, setFilteredPreinscripciones] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('crear');
    const [currentPreinscripcion, setCurrentPreinscripcion] = useState({ 
        id: null, 
        id_usuario: '', 
        id_cohorte: '', 
        fecha_hora_preinscripcion: new Date().toISOString(),
        id_estado: '',
        observaciones: '' 
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [preinscripcionToDelete, setPreinscripcionToDelete] = useState(null);
    const [message, setMessage] = useState(null);
    const [mobilePage, setMobilePage] = useState(1);
    const observer = useRef();

    // Datos de ejemplo (en un entorno real, se cargarían desde la API)
    const [cohortes] = useState([
        { id: 1, nombre: 'Cohorte 2023-1' },
        { id: 2, nombre: 'Cohorte 2023-2' },
    ]);
    
    const [estados] = useState([
        { id: 1, nombre: 'Pendiente' },
        { id: 2, nombre: 'Aprobada' },
        { id: 3, nombre: 'Rechazada' },
    ]);
    
    const [usuarios] = useState([
        { id: 1, nombre: 'Usuario 1', email: 'usuario1@ejemplo.com' },
        { id: 2, nombre: 'Usuario 2', email: 'usuario2@ejemplo.com' },
    ]);

    // Cargar preinscripciones
    useEffect(() => {
        const fetchPreinscripciones = async () => {
            try {
                setLoading(true);
                

                const response = await axios.get(API_URL);
                console.log(response);
                setPreinscripciones(response.data.data || []);
                setFilteredPreinscripciones(response.data.data || []);
                setError(null);
            } catch (err) {
                setError('Error al cargar las preinscripciones');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }

            
        };
        fetchPreinscripciones();
    }, []);

    // Filtrar preinscripciones
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPreinscripciones(preinscripciones);
        } else {
            const filtered = preinscripciones.filter(p =>
                p.id.toString().includes(searchTerm.toLowerCase()) ||
                p.id_usuario.toString().includes(searchTerm.toLowerCase()) ||
                p.id_cohorte.toString().includes(searchTerm.toLowerCase()) ||
                p.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPreinscripciones(filtered);
        }
        setMobilePage(1);
    }, [searchTerm, preinscripciones]);

    const handleOpenModal = (mode, preinscripcion = null) => {
        setModalMode(mode);
        if (mode === 'editar' && preinscripcion) {
            setCurrentPreinscripcion({
                ...preinscripcion,
                fecha_hora_preinscripcion: preinscripcion.fecha_hora_preinscripcion || new Date().toISOString()
            });
        } else {
            setCurrentPreinscripcion({
                id: null,
                id_usuario: '',
                id_cohorte: '',
                fecha_hora_preinscripcion: new Date().toISOString(),
                id_estado: '',
                observaciones: ''
            });
        }
        setValidationErrors({});
        setModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPreinscripcion(prev => ({
            ...prev,
            [name]: value
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!currentPreinscripcion.id_usuario) errors.id_usuario = 'Usuario es requerido';
        if (!currentPreinscripcion.id_cohorte) errors.id_cohorte = 'Cohorte es requerida';
        if (!currentPreinscripcion.id_estado) errors.id_estado = 'Estado es requerido';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            if (modalMode === 'crear') {
                await axios.post(API_URL, currentPreinscripcion);
                setMessage({ type: 'success', text: 'Preinscripción creada correctamente' });
            } else {
                const a = await axios.put(`${API_URL}/${currentPreinscripcion.id}`, {
                  ...currentPreinscripcion,
                  id: undefined,
                  fecha_hora_preinscripcion: format(new Date(currentPreinscripcion.fecha_hora_preinscripcion), 'yyyy-MM-dd HH:mm:ss')

                });
                console.log(a);
                setMessage({ type: 'success', text: 'Preinscripción actualizada correctamente' });
            }
            const response = await axios.get(API_URL);
            setPreinscripciones(response.data.data || []);
            setModalOpen(false);
        } catch (err) {
            console.error('Error:', err);
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Error al procesar la solicitud' 
            });
            if (err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (preinscripcion) => {
        setPreinscripcionToDelete(preinscripcion);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!preinscripcionToDelete) return;
        
        try {
            setLoading(true);
            const a = await axios.delete(`${API_URL}/${preinscripcionToDelete.id}`);
            console.log(a);
            const response = await axios.get(API_URL);
            setPreinscripciones(response.data.data || []);
            setMessage({ type: 'success', text: 'Preinscripción eliminada' });
        } catch (err) {
            console.error('Error:', err);
            setMessage({ type: 'error', text: 'Error al eliminar' });
        } finally {
            setLoading(false);
            setDeleteConfirmOpen(false);
            setPreinscripcionToDelete(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return format(date, "dd/MM/yyyy HH:mm", { locale: es });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return dateString;
        }
    };

    // Limpiar mensaje después de 5 segundos
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Preinscripciones</h1>
                        <p className="text-gray-600">Administra las preinscripciones de los usuarios</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal('crear')}
                        className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nueva Preinscripción
                    </button>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Buscar preinscripciones..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <p>{error}</p>
                    </div>
                ) : filteredPreinscripciones.length === 0 ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay preinscripciones</h3>
                            <p className="mt-1 text-gray-500">
                                {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'Comienza creando una nueva preinscripción.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cohorte</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.isArray(filteredPreinscripciones) && filteredPreinscripciones.map((preinscripcion) => (
                                        <tr key={preinscripcion.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {preinscripcion.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {usuarios.find(u => u.id === preinscripcion.id_usuario)?.nombre || `Usuario #${preinscripcion.id_usuario}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cohortes.find(c => c.id === preinscripcion.id_cohorte)?.nombre || `Cohorte #${preinscripcion.id_cohorte}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(preinscripcion.fecha_hora_preinscripcion)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    preinscripcion.id_estado === 2 ? 'bg-green-100 text-green-800' : 
                                                    preinscripcion.id_estado === 3 ? 'bg-red-100 text-red-800' : 
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {estados.find(e => e.id === preinscripcion.id_estado)?.nombre || `Estado #${preinscripcion.id_estado}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleOpenModal('editar', preinscripcion)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(preinscripcion)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal de confirmación de eliminación */}
                {deleteConfirmOpen && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Eliminar preinscripción
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    ¿Estás seguro de que deseas eliminar esta preinscripción? Esta acción no se puede deshacer.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleDeleteConfirm}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Eliminar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirmOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de formulario */}
                {modalOpen && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                {modalMode === 'crear' ? 'Nueva Preinscripción' : 'Editar Preinscripción'}
                                            </h3>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    {/* Usuario */}
                                                    <div>
                                                        <label htmlFor="id_usuario" className="block text-sm font-medium text-gray-700">
                                                            Usuario <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            id="id_usuario"
                                                            name="id_usuario"
                                                            value={currentPreinscripcion.id_usuario || ''}
                                                            onChange={handleInputChange}
                                                            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${validationErrors.id_usuario ? 'border-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500'} rounded-md`}
                                                        >
                                                            <option value="">Seleccionar usuario</option>
                                                            {usuarios.map(usuario => (
                                                                <option key={usuario.id} value={usuario.id}>
                                                                    {usuario.nombre} ({usuario.email})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {validationErrors.id_usuario && (
                                                            <p className="mt-1 text-sm text-red-600">{validationErrors.id_usuario}</p>
                                                        )}
                                                    </div>

                                                    {/* Cohorte */}
                                                    <div>
                                                        <label htmlFor="id_cohorte" className="block text-sm font-medium text-gray-700">
                                                            Cohorte <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            id="id_cohorte"
                                                            name="id_cohorte"
                                                            value={currentPreinscripcion.id_cohorte || ''}
                                                            onChange={handleInputChange}
                                                            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${validationErrors.id_cohorte ? 'border-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500'} rounded-md`}
                                                        >
                                                            <option value="">Seleccionar cohorte</option>
                                                            {cohortes.map(cohorte => (
                                                                <option key={cohorte.id} value={cohorte.id}>
                                                                    {cohorte.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {validationErrors.id_cohorte && (
                                                            <p className="mt-1 text-sm text-red-600">{validationErrors.id_cohorte}</p>
                                                        )}
                                                    </div>

                                                    {/* Fecha de Preinscripción */}
                                                    <div>
                                                        <label htmlFor="fecha_hora_preinscripcion" className="block text-sm font-medium text-gray-700">
                                                            Fecha de Preinscripción
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            id="fecha_hora_preinscripcion"
                                                            name="fecha_hora_preinscripcion"
                                                            value={currentPreinscripcion.fecha_hora_preinscripcion ? new Date(currentPreinscripcion.fecha_hora_preinscripcion).toISOString().slice(0, 16) : ''}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>

                                                    {/* Estado */}
                                                    <div>
                                                        <label htmlFor="id_estado" className="block text-sm font-medium text-gray-700">
                                                            Estado <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            id="id_estado"
                                                            name="id_estado"
                                                            value={currentPreinscripcion.id_estado || ''}
                                                            onChange={handleInputChange}
                                                            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${validationErrors.id_estado ? 'border-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500'} rounded-md`}
                                                        >
                                                            <option value="">Seleccionar estado</option>
                                                            {estados.map(estado => (
                                                                <option key={estado.id} value={estado.id}>
                                                                    {estado.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {validationErrors.id_estado && (
                                                            <p className="mt-1 text-sm text-red-600">{validationErrors.id_estado}</p>
                                                        )}
                                                    </div>

                                                    {/* Observaciones */}
                                                    <div className="sm:col-span-2">
                                                        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                                                            Observaciones
                                                        </label>
                                                        <textarea
                                                            id="observaciones"
                                                            name="observaciones"
                                                            rows="3"
                                                            value={currentPreinscripcion.observaciones || ''}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                                                    >
                                                        {loading ? 'Guardando...' : 'Guardar'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setModalOpen(false)}
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
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

export default GestionPreinscripcion;
