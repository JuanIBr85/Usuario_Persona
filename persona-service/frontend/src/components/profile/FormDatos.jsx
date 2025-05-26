import InputValidate from "@/components/inputValidate/InputValidate"
import { Button } from "@/components/ui/button"


export default function FormDatos({ handleSubmit, fixedData, editableData }) {
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Datos fijos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <InputValidate
                    id="nombre"
                    type="text"
                    labelText="Nombre"
                    value={fixedData.nombre}
                    className="bg-gray-100 cursor-not-allowed"
                    readOnly
                />
                <InputValidate
                    id="apellido"
                    type="text"
                    labelText="Apellido"
                    value={fixedData.apellido}
                    className="bg-gray-100 cursor-not-allowed"
                    readOnly
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputValidate
                    id="dni"
                    type="text"
                    labelText="DNI"
                    value={fixedData.dni}
                    className="bg-gray-100 cursor-not-allowed w-full"
                    readOnly
                />
                <InputValidate
                    id="tipo_documento"
                    type="text"
                    labelText="Tipo de documento"
                    value="PLACEHOLDER DE UN SELECT"
                    className="bg-gray-100 cursor-not-allowed w-full"
                    readOnly
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputValidate
                    id="fecha_nacimiento_persona"
                    type="date"
                    placeholder="Ingresa tu fecha de nacimiento"
                    labelText="Fecha de nacimiento"
                    value={editableData.fecha_nacimiento_persona}
                    validateMessage="La fecha de nacimiento es requerida"
                    required
                />

                <InputValidate
                    id="email"
                    type="email"
                    labelText="Email"
                    value={fixedData.email}
                    className="bg-gray-100 cursor-not-allowed"
                    readOnly
                />
            </div>
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