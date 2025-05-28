import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"

export default function FormContacto({ handleSubmit, fixedData, editableData }) {
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Datos editables con InputValidate */}
            <InputValidate
                id="telefono_fijo_"
                type="tel"
                placeholder="Ingresa tu teléfono"
                labelText="Teléfono Fijo"
                value={editableData.telefono}
                validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
                validateMessage="Ingresa un número de teléfono válido"
            />
            <InputValidate
                id="telefono_movil_"
                type="tel"
                placeholder="Ingresa tu teléfono"
                labelText="Teléfono movil"
                value={editableData.telefono}
                validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
                validateMessage="Ingresa un número de teléfono válido"
            />
            <InputValidate
                id="red_social_contacto"
                type="text"
                placeholder="Red social de contacto"
                labelText="Red social de contacto"
                value={editableData.telefono}
            />

            <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full">
                    Guardar Cambios
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate('/Login')}
                >
                    Volver
                </Button>
            </div>
        </form>
    );
}