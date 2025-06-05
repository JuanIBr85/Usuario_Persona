import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"

export default function FormDomicillio({ handleSubmit, domicilio, handleChange }) {
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Calle */}
            <InputValidate
                id="domicilio_calle"
                type="text"
                placeholder="Ingresa el nombre de la calle"
                labelText="Calle"
                value={domicilio?.domicilio_calle || ''}
                onChange={(e) => handleChange('domicilio.domicilio_calle', e.target.value)}
                validatePattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$"
                validateMessage="Ingresa un nombre de calle válido (2-50 caracteres, solo letras y espacios)"
                required
            />

            {/* Campo Número */}
            <InputValidate
                id="domicilio_numero"
                type="text"
                placeholder="Número de domicilio"
                labelText="Número"
                value={domicilio?.domicilio_numero || ''}
                onChange={(e) => handleChange('domicilio.domicilio_numero', e.target.value)}
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
                onChange={(e) => handleChange('domicilio.domicilio_piso', e.target.value)}
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
                onChange={(e) => handleChange('domicilio.domicilio_dpto', e.target.value)}
                validatePattern="^[a-zA-Z0-9]{1,2}$|^$"
                validateMessage="Ingresa un departamento válido (máximo 2 caracteres)"
            />

            {/* Campo Código Postal */}
            <InputValidate
                id="codigo_postal"
                type="number"
                placeholder="Código postal"
                labelText="Código Postal"
                value={domicilio?.codigo_postal?.codigo_postal || ''}
                onChange={(e) => handleChange('domicilio.codigo_postal.codigo_postal', e.target.value)}
                validatePattern="^[0-9]{4,8}$"
                validateMessage="Ingresa un código postal válido (4-8 dígitos)"
                required
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