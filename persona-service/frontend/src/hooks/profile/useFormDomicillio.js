import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { useRef } from "react"
import { PersonaService } from "@/services/personaService"
import { useCallback } from "react"
import { formSubmitJson } from "@/utils/formUtils"
import { Ban } from "lucide-react"

export function useFormDomicilio(domicilio, setPersonaData, persona_id, showDialog, okDialog, errorDialog) {
    const [localidad, setLocalidad] = useState(domicilio.domicilio_postal.localidad);
    const inputCPRef = useRef(null);
    const [loading, setLoading] = useState(false);

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
    return {handleSubmit, inputCPRef, localidad, setLocalidad, loading}
}