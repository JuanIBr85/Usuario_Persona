import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"
import {
    SelectItem
} from "@/components/ui/select"
import SimpleSelect from "@/components/SimpleSelect"
import { useFormDomicilio } from "@/hooks/profile/useFormDomicillio"
import Loading from "@/components/loading/Loading"
import { SimpleDialog } from "@/components/SimpleDialog"
import { Ban } from "lucide-react"
import { useState } from "react"

export default function FormDomicillio({ domicilio, setPersonaData, persona_id, showDialog, okDialog, errorDialog }) {

    const { handleSubmit, localidades, codigoPostal, setCodigoPostal, inputCPRef, localidad, loading } = useFormDomicilio(domicilio, setPersonaData, persona_id, showDialog, okDialog, errorDialog);

    return (
        <>
            {loading && <Loading isFixed={true} />}
            <form onSubmit={handleSubmit}>
                <div className="min-h-69 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
                        {/* Campo Calle */}
                        <InputValidate
                            id="domicilio_calle"
                            type="text"
                            placeholder="Ingresa el nombre de la calle"
                            labelText="Calle"
                            value={domicilio?.domicilio_calle || ''}
                            validatePattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.]{2,50}$"
                            validationMessage="Ingresa un nombre de calle válido (2-50 caracteres, solo letras, espacios, puntos y comas)"
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
                            validatePattern="^[0-9]{1,9}[a-zA-Z]?$"
                            validationMessage="Ingresa un número válido (ej: 1234, 123A)"
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
                            validationMessage="Ingresa un piso válido (máximo 3 dígitos)"
                        />

                        {/* Campo Departamento (opcional) */}
                        <InputValidate
                            id="domicilio_dpto"
                            type="text"
                            placeholder="Departamento (opcional)"
                            labelText="Departamento"
                            value={domicilio?.domicilio_dpto || ''}
                            validatePattern="^[a-zA-Z0-9]{1,2}$|^$"
                            validationMessage="Ingresa un departamento válido (máximo 2 caracteres)"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                        {/* Campo Código Postal */}
                        <InputValidate
                            id="codigo_postal"
                            type="text"
                            placeholder="Código postal"
                            labelText={<>Código Postal<a href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" className="text-indigo-600 hover:underline cursor-pointer">¿no sabés el código?</a></>}
                            value={codigoPostal}
                            ref={inputCPRef}
                            onChange={(e) => setCodigoPostal(e.target.value)}
                            validatePattern="^(?:[A-Za-z]\d{4}[A-Za-z]{3}|\d{4})$"
                            validationMessage="Ingrese CP (4 dígitos) o CPA (1 letra + 4 dígitos + 3 letras, todo en mayúsculas)"
                            required
                        />
                        <SimpleSelect
                            name="localidad"
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
                    </div>
                    {/* Campo Referencia */}
                    <InputValidate
                        id="domicilio_referencia"
                        type="text"
                        placeholder="Referencia (ej: Entre Calles X e Y)"
                        labelText="Referencia"
                        value={domicilio?.domicilio_referencia || ''}
                        validatePattern=".{0,200}"
                        validationMessage="Máximo 200 caracteres"
                    />
                </div>
                <div className="flex flex-col gap-3 pt-4">
                    <Button type="submit" className="w-full">
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </>
    );
}