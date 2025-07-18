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
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm"
import CPLocalidad from "@/components/CPLocalidad"

export default function FormDomicillio({ domicilio, setPersonaData, persona_id, showDialog, okDialog, errorDialog }) {

    const { handleSubmit, localidad, setLocalidad, loading } = useFormDomicilio(domicilio, setPersonaData, persona_id, showDialog, okDialog, errorDialog);

    return (
        <>
            {loading && <Loading isFixed={true} />}
            <form onSubmit={handleSubmit}>
                <div className="min-h-69 space-y-4">
                    <ResponsiveColumnForm className={"md:grid-cols-6"}>
                        {/* Campo Calle */}
                        <InputValidate
                            id="domicilio_calle"
                            maxLength={50}
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
                            maxLength={10}
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
                            maxLength={3}
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
                            maxLength={2}
                            type="text"
                            placeholder="Departamento (opcional)"
                            labelText="Departamento"
                            value={domicilio?.domicilio_dpto || ''}
                            validatePattern="^[a-zA-Z0-9]{1,2}$|^$"
                            validationMessage="Ingresa un departamento válido (máximo 2 caracteres)"
                        />
                    </ResponsiveColumnForm>

                    <CPLocalidad showDialog={showDialog} localidad={localidad} codigo_postal={domicilio.domicilio_postal.codigo_postal} setLocalidad={setLocalidad} />
                    {/* Campo Referencia */}
                    <InputValidate
                        id="domicilio_referencia"
                        type="text"
                        maxLength={200}
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