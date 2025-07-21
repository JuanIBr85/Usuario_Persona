import { useState } from "react";
import { useRef } from "react";
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";
import InputValidate from "@/components/inputValidate/InputValidate"
import SimpleSelect from "@/components/SimpleSelect"
import { SelectItem } from "@/components/ui/select"
import { useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { PersonaService } from "@/services/personaService"

function CPLocalidad({showDialog, localidad, codigo_postal, setLocalidad, id_codigo_postal="codigo_postal", id_localidad="localidad"}) {
    const [codigoPostal, setCodigoPostal] = useState(codigo_postal);
    const [codigoPostalAnterior, setCodigoPostalAnterior] = useState(codigo_postal);
    const [localidades, setLocalidades] = useState([]);
    const inputCPRef = useRef(null);
    
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
        
        setCodigoPostalAnterior(codigoPostal);

        PersonaService
            .get_localidades_by_codigo_postal(cpa)
            .then(response => {
                setLocalidades(response.data || []);
                if(codigoPostalAnterior!==codigoPostal){
                    setLocalidad(response.data[0]);
                }
            })
            .catch(error => {
                console.error('Error fetching localidades:', error);
                if(showDialog){
                    showDialog(
                        "Ocurrió un error",
                        "No se pudieron obtener las localidades. Intenta nuevamente.",
                    );
                }
                setLocalidades([]);
            });
    }, [codigoPostal]);

    useDebounce(fetchLocalidades, 500, [codigoPostal]);


    return (<ResponsiveColumnForm>
        {/* Campo Código Postal */}
        <InputValidate
            id={id_codigo_postal}
            maxLength={8}
            type="text"
            placeholder="Código postal"
            labelText={<>Código Postal<a href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" className="text-indigo-600 hover:underline cursor-pointer">¿no sabés el código?</a></>}
            value={codigoPostal}
            ref={inputCPRef}
            onChange={(e) => setCodigoPostal(e.target.value)}
            cleanRegex={/[^0-9]/g}
            validatePattern="^(?:[A-Za-z]\d{4}[A-Za-z]{3}|\d{4})$"
            validationMessage="Ingrese CP (4 dígitos) o CPA (1 letra + 4 dígitos + 3 letras, todo en mayúsculas)"
            required
        />
        <SimpleSelect
            id={id_localidad}
            label="Localidad"
            placeholder="Selecciona una localidad"
            value={localidad}
            required
        >
            {localidades.map((localidad) => (
                <SelectItem key={localidad} value={localidad}>
                    {localidad}
                </SelectItem>
            ))}
        </SimpleSelect>
    </ResponsiveColumnForm>);
}

export default CPLocalidad;
