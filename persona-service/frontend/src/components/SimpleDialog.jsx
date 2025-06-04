import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

/**
 * Componente de diálogo basado en AlertDialog.
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {string} title - Título del diálogo
 * @param {string} description - Contenido principal del mensaje del diálogo
 * @param {string} [action="Aceptar"] - Texto para el botón de acción principal
 * @param {string} [cancel=""] - Texto para el botón de cancelar (si está vacío, no se muestra el botón)
 * @param {Function} [cancelHandle] - Función de retorno para el clic en el botón de cancelar
 * @param {boolean} isOpen - Controla la visibilidad del diálogo
 * @param {Function} setIsOpen - Función para actualizar el estado de apertura del diálogo
 * @returns {JSX.Element} Un diálogo modal con título, descripción y botones de acción
 */
function SimpleDialog({ title, description, action = "Aceptar", cancel = "", actionHandle, cancelHandle, isOpen, setIsOpen }) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {(cancel) && <AlertDialogCancel onClick={cancelHandle}>{cancel}</AlertDialogCancel>}
          <AlertDialogAction onClick={actionHandle}>{action}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Componente para mostrar mensajes de error de forma estilizada.
 * 
 * @param {Object} error - Objeto de error que contiene los mensajes a mostrar
 * @param {Object} error.data - Datos del error
 * @param {string} error.data.message - Mensaje general del error
 * @param {Object} error.data.error - Objeto con errores específicos por campo
 * @returns {JSX.Element} Componente de React que muestra los mensajes de error
 */
function FetchErrorMessage(error) {
  return (
    <div className="border border-red-400 bg-red-50 text-red-700 p-4 my-3 rounded-md shadow-sm">
      {/* Mostrar el mensaje general del error */}
      <div className="font-semibold text-red-800 mb-3 text-lg">
        {error.data.message}
      </div>

      {/* Contenedor para los errores específicos de campo */}
      <div className="mt-2">
        {Object.entries(error.data.error).map(([fieldName, fieldSpecificErrors]) => (
          <div key={fieldName} className="mb-2 last:mb-0">
            {/* Nombre del campo con error */}
            <div className="font-medium text-red-700 capitalize mb-1">
              {fieldName.replace(/_/g, ' ')}:
            </div>
            {/* Lista de mensajes de error para ese campo */}
            <ul className="list-disc list-inside pl-2 text-sm text-red-600">
              {fieldSpecificErrors.map((errMsg, index) => (
                <li key={index} className="mb-0.5">
                  {errMsg}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export { SimpleDialog, FetchErrorMessage };