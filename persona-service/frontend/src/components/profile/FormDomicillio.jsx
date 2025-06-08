import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { useRef } from "react"
import { PersonaService } from "@/services/personaService"
import { Label } from "@/components/ui/label"
import {
    SelectItem
} from "@/components/ui/select"
import { useCallback } from "react"
import { Link } from "react-router-dom"
import SimpleSelect from "@/components/SimpleSelect"

export default function FormDomicillio({ handleSubmit, domicilio, handleChange }) {
    const [codigoPostal, setCodigoPostal] = useState(domicilio.domicilio_postal.codigo_postal);
    const [localidades, setLocalidades] = useState([]);
    const inputCPRef = useRef(null);
    const [localidad, setLocalidad] = useState(domicilio.domicilio_postal.localidad);

    const fetchLocalidades = useCallback(() => {
        if (String(codigoPostal).trim().length < 4) {
            setLocalidades([]);
            return;
        }
        
        if (!inputCPRef.current?.checkValidity()) {
            setLocalidades([]);
            return;
        }
        PersonaService
        .get_localidades_by_codigo_postal(codigoPostal)
        .then(response => {
            setLocalidades(response.data || []);
        })
        .catch(error => {
            console.error('Error fetching localidades:', error);
            setLocalidades([]);
        });
    }, [codigoPostal]); 

    useDebounce(fetchLocalidades, 500, [codigoPostal]);
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
                {/* Campo Calle */}
                <InputValidate
                    id="domicilio_calle"
                    type="text"
                    placeholder="Ingresa el nombre de la calle"
                    labelText="Calle"
                    value={domicilio?.domicilio_calle || ''}
                    validatePattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$"
                    validateMessage="Ingresa un nombre de calle válido (2-50 caracteres, solo letras y espacios)"
                    containerClassName="sm:col-span-3"
                    required
                />

                {/* Campo Número */}
                <InputValidate
                    id="domicilio_numero"
                    type="text"
                    placeholder="Número de domicilio"
                    labelText="Número"
                    value={domicilio?.domicilio_numero || ''}
                    validatePattern="^[0-9]{1,4}[a-zA-Z]?$"
                    validateMessage="Ingresa un número válido (ej: 1234, 123A)"
                    required
                />

                {/* Campo Piso (opcional) */}
                <InputValidate
                    id="domicilio_piso"
                    type="text"
                    placeholder="Piso (opcional)"
                    labelText="Piso"
                    value={domicilio?.domicilio_piso || ''}
                    validatePattern="^[0-9]{1,3}$|^$"
                    validateMessage="Ingresa un piso válido (máximo 3 dígitos)"
                />

                {/* Campo Departamento (opcional) */}
                <InputValidate
                    id="domicilio_dpto"
                    type="text"
                    placeholder="Departamento (opcional)"
                    labelText="Departamento"
                    value={domicilio?.domicilio_dpto || ''}
                    validatePattern="^[a-zA-Z0-9]{1,2}$|^$"
                    validateMessage="Ingresa un departamento válido (máximo 2 caracteres)"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                {/* Campo Código Postal */}
                <InputValidate
                    type="text"
                    placeholder="Código postal"
                    labelText={<>Código Postal<a className="text-indigo-600 hover:underline cursor-pointer">¿no sabes el codigo?</a></>}
                    value={codigoPostal}
                    ref={inputCPRef}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                    validatePattern="^[0-9]{4,8}$"
                    validateMessage="Ingresa un código postal válido (CPA o 4 dígitos)"
                    required
                />
                <SimpleSelect
                    name="localidad"
                    label="Localidad"
                    placeholder="Selecciona una localidad"
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    required
                >
                    {localidades.map((localidad) => (
                        <SelectItem key={localidad} value={localidad}>
                            {localidad}
                        </SelectItem>
                    ))}
                </SimpleSelect>
            </div>
            {/* Campo Referencia */}
            <InputValidate
                id="domicilio_referencia"
                type="text"
                placeholder="Referencia (ej: Entre Calles X e Y)"
                labelText="Referencia"
                value={domicilio?.domicilio_referencia || ''}
                validatePattern=".{0,100}"
                validateMessage="Máximo 100 caracteres"
            />

            <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full">
                    Guardar Cambios
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => window.history.back()}
                >
                    Volver
                </Button>
            </div>
        </form>
    );
}