import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { useRef } from "react"
import { PersonaService } from "@/services/personaService"
import { useCallback } from "react"
import { formSubmitJson } from "@/utils/formUtils"
import { Ban } from "lucide-react"

export function useFormDomicilio({domicilio, setPersonaData, persona_id, showDialog, okDialog, errorDialog}) {
    const [codigoPostal, setCodigoPostal] = useState(domicilio.domicilio_postal.codigo_postal);
    const [localidades, setLocalidades] = useState([]);
    const [localidad, setLocalidad] = useState(domicilio.domicilio_postal.localidad);
    const inputCPRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const fetchLocalidades = useCallback(() => {
        let cpa = String(codigoPostal);
        if (cpa.trim().length < 4) {
            setLocalidades([]);
            return;
        }

        if (!inputCPRef.current?.checkValidity()) {
            setLocalidades([]);
            return;
        }

        //Convierte el CPA a CP
        if (cpa.length > 4) {
            cpa = cpa.substring(1, 5);
            setCodigoPostal(cpa);
            return;
        }

        PersonaService
            .get_localidades_by_codigo_postal(cpa)
            .then(response => {
                setLocalidades(response.data || []);
            })
            .catch(error => {
                console.error('Error fetching localidades:', error);
                showDialog(
                    "Ocurrió un error",
                    "No se pudieron obtener las localidades. Intenta nuevamente.",
                );
                setLocalidades([]);
            });
    }, [codigoPostal]);

    useDebounce(fetchLocalidades, 500, [codigoPostal]);


    const handleSubmit = async (event) => {
        const { localidad, codigo_postal, ...domicilio } = await formSubmitJson(event);
        document.activeElement.blur();
        
        const domicilioData = {
            domicilio: {
                ...domicilio,
                codigo_postal: {
                    codigo_postal,
                    localidad
                }
            }
        };

        setLoading(true);
        PersonaService.editar_restringido(domicilioData)
            .then(response => {
                setLoading(false);
                setPersonaData(response.data);
                okDialog();
            })
            .catch(error => {
                errorDialog();
            })
            .finally(() => setLoading(false));
    };
    return {handleSubmit, localidades, setLocalidades, codigoPostal, setCodigoPostal, inputCPRef, localidad, setLocalidad, loading}
}