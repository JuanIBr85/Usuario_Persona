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

function SimpleDialog({ title, description, action = "Aceptar", cancel = "", cancelHandle, isOpen, setIsOpen }) {
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
          <AlertDialogAction>{action}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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