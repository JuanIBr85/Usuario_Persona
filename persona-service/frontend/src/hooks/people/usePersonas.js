import { useEffect, useState } from "react";
import { PersonaService } from "@/services/personaService";
import { formSubmitJson } from "@/utils/formUtils";
import { traducirRateLimitMessage } from "@/utils/traductores";
/**
 * Hook personalizado que encapsula la lógica de obtención de personas,
 * tipos de documentos, redes sociales y localidades según código postal.
 *
 * Este hook está diseñado para usarse en componentes relacionados a la
 * administración de personas y centraliza la carga inicial de datos
 * necesarios para formularios o tablas.
 *
 * @returns {Object} Un objeto con:
 *  - users: Lista de usuarios/personas
 *  - setUsers: Función para actualizar usuarios
 *  - tiposDocumentos: Lista de tipos de documentos válidos
 *  - redesSociales: Lista de redes sociales disponibles
 *  - localidades: Lista de localidades relacionadas a un código postal
 *  - fetchLocalidadesPorCodigoPostal: Función para actualizar localidades según código postal
 */
export function usePersonas() {
    // Estado: Lista de personas obtenidas
    const [users, setUsers] = useState([]);

    // Estado: Tipos de documentos disponibles
    const [tiposDocumentos, setTiposDocumentos] = useState([]);

    // Estado: Redes sociales disponibles
    const [redesSociales, setRedesSociales] = useState([]);

    // Estado: Localidades asociadas al código postal ingresado
    const [localidades, setLocalidades] = useState([]);

    // Estado para notificaciones
    const [alert, setAlert] = useState(null);

    // Efecto: Carga inicial de datos (usuarios, redes sociales, tipos de documento)
    useEffect(() => {
        // Cargar todas las personas desde el servicio
        PersonaService.get_all()
            .then((res) => {
                if (res && res.data && Array.isArray(res.data)) {
                    // Mapeo de datos crudos a estructura usada por el frontend
                    const mappedUsers = res.data.map((persona) => ({
                        id: persona.id_persona,
                        usuario_id: persona.usuario_id,
                        nombre: persona.nombre_persona,
                        apellido: persona.apellido_persona,
                        tipo_documento: persona.tipo_documento,
                        nro_documento: persona.num_doc_persona,
                        fecha_nacimiento: persona.fecha_nacimiento_persona,
                    }));
                    setUsers(mappedUsers);
                }
            })
            .catch((err) => {
                console.error("Error obteniendo usuarios:", err);
            });

        // Cargar redes sociales
        PersonaService.get_redes_sociales()
            .then((res) => {
                setRedesSociales(res?.data || []);
            })
            .catch(() => setRedesSociales([]));

        // Cargar tipos de documentos
        PersonaService.get_tipos_documentos()
            .then((res) => {
                setTiposDocumentos(res?.data || []);
            })
            .catch(() => setTiposDocumentos([]));
    }, []);

    // Función para extraer el mensaje de error del servidor.  
    // El metodo tipico de "const rawMsg = e?.data?.message || e?.message || "Error desconocido."
    // no funcionaba por lo que se optó por una función más robusta
    const extractServerError = (err) => {
        if (err && typeof err.message === "string") {
            // Busca texto tipo Datos: { ... }
            const match = err.message.match(/Datos:\s*(\{[\s\S]*\})/);
            if (match && match[1]) {
                try {
                    const parsed = JSON.parse(match[1]);
                    return parsed?.error?.server
                        || parsed?.message
                        || "Error desconocido";
                } catch (e) {
                    // Si el JSON está mal, muestra el string bruto
                    return "Error desconocido";
                }
            }
            // No encontró JSON, muestra mensaje base
            return err.message;
        }
        // Si no hay message, retorna string por defecto
        return "Error desconocido";
    };

    /**
     * Obtiene localidades según un código postal dado.
     * Solo realiza la petición si el código postal tiene al menos 4 caracteres.
     *
     * @param {string} codigoPostal - El código postal a consultar.
     */
    const fetchLocalidadesPorCodigoPostal = (codigoPostal) => {
        if (!codigoPostal || codigoPostal.length < 4) {
            setLocalidades([]);
            return;
        }

        PersonaService.get_localidades_by_codigo_postal(codigoPostal)
            .then((res) => {
                setLocalidades(res?.data || []);
            })
            .catch(() => setLocalidades([]));
    };

    /**
     * Elimina una persona por su ID.
     * Actualiza la lista local tras eliminar exitosamente.
     * @param {number} id - ID de la persona a eliminar
     */
    const handleDelete = (id) => {
        PersonaService.borrar(id)
            .then(() => {
                setUsers(users.filter((user) => user.id !== id));
                setAlert({
                    title: "Éxito",
                    description: "La persona se eliminó correctamente",
                    variant: "success"
                });
            })
            .catch((err) => {
                const msg = extractServerError(err);

                console.log("Error al eliminar persona:", msg);

                setAlert({
                    title: "Error",
                    description: msg,
                    variant: "destructive"
                });
            });
    };

    /**
     * Maneja el envío del formulario de edición.
     * Actualiza la persona en la lista local y hace petición para actualizar en backend.
     * @param {Event} e - Evento submit del formulario
     * @param {Object} editingUser - Datos del usuario que se está editando
     * @returns {Promise<Object>} Objeto con el resultado de la operación
     */
    const handleEditSubmit = async (e, editingUser) => {
        e.preventDefault();

        // Construye el body con todos los campos para enviar al backend
        const body = {
            nombre_persona: editingUser.nombre || "",
            apellido_persona: editingUser.apellido || "",
            tipo_documento: editingUser.tipo_documento || "DNI",
            num_doc_persona: editingUser.nro_documento || "",
            fecha_nacimiento_persona: editingUser.fecha_nacimiento || "",
            usuario_id: editingUser.usuario_id || null,
        };

        try {
            await PersonaService.editar(editingUser.id, body);

            // Actualiza el estado local solo si la petición fue exitosa
            setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));

            setAlert({
                title: "Éxito",
                description: "La persona se actualizó correctamente",
                variant: "success"
            });

            return { success: true };
        } catch (err) {
            console.error("Error actualizando persona:", err);

            setAlert({
                title: "Error al actualizar persona",
                description: err?.data?.error?.server || "Error actualizando persona",
                variant: "destructive"
            });

            return { success: false, error: err };
        }
    };

    // Exporta el estado y funciones que serán usados en el componente  
    return {
        users,
        setUsers,
        tiposDocumentos,
        redesSociales,
        localidades,
        alert,
        setAlert,
        fetchLocalidadesPorCodigoPostal,
        setLocalidades,
        handleDelete,
        handleEditSubmit,
    };
}
