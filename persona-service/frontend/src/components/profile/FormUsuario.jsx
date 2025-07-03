import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { SimpleDialog } from "@/components/SimpleDialog";
import Loading from "@/components/loading/Loading";
import { AuthService } from "@/services/authService";
import { formSubmitJson } from "@/utils/formUtils";
import { useAuthContext } from "@/context/AuthContext";
import { useState } from "react";

export default function FormUsuario() {
  const { authData, updateData, removeAuthData } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setLoading(true);
    AuthService.updateUser(formData)
      .then((response) => {
        updateData({ user: { ...authData.user, ...response.data } });
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        setError(true);
        setOpenDialog(true);
      })
      .finally(() => setLoading(false));
  };

  const confirmDelete = () => {
    setLoading(true);
    AuthService.deleteUser()
      .then(() => {
        removeAuthData("Usuario eliminado");
        window.location.href = "/auth/login";
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        setError(true);
        setOpenDialog(true);
      })
      .finally(() => {
        setLoading(false);
        setOpenDeleteDialog(false);
      });
  };

  return (
    <>
      {loading && <Loading isFixed={true} />}

      <div className="w-full max-w-md mx-auto space-y-4 px-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputValidate
            id="nombre_usuario"
            type="text"
            labelText="Nombre de usuario"
            placeholder="Ingresa tu nombre de usuario"
            value={authData.user.nombre_usuario || ""}
            required
          />
          <InputValidate
            id="email_usuario"
            type="email"
            labelText="Email"
            placeholder="Ingresa tu email"
            value={authData.user.email_usuario || ""}
            required
          />

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" className="w-full sm:w-auto">
              Guardar Cambios
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => setOpenDeleteDialog(true)}
            >
              Eliminar Cuenta
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <SimpleDialog
          title="Ocurrió un error"
          description="No se pudieron guardar los datos. Intenta nuevamente."
          isOpen={openDialog}
          actionHandle={() => setOpenDialog(false)}
          action="Cerrar"
        />
      )}

      <SimpleDialog
        title="¿Eliminar cuenta?"
        description="Esta acción no se puede deshacer. ¿Deseas eliminar tu cuenta?"
        isOpen={openDeleteDialog}
        cancel="Cancelar"
        action="Eliminar"
        cancelHandle={() => setOpenDeleteDialog(false)}
        actionHandle={confirmDelete}
      />
    </>
  );
}
