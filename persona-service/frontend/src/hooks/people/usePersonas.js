import { useEffect, useState } from "react";
import { PersonaService } from "@/services/personaService";

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

    // Exporta el estado y funciones que serán usados en el componente  
    return {
        users,
        setUsers,
        tiposDocumentos,
        redesSociales,
        localidades,
        fetchLocalidadesPorCodigoPostal,
    };
}
