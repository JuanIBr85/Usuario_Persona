import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { SimpleDialog } from "@/components/SimpleDialog";
import Loading from "@/components/loading/Loading";
import { AuthService } from "@/services/authService";
import { formSubmitJson } from "@/utils/formUtils";
import { useAuthContext } from "@/context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FormUsuario() {
  const { authData, updateData, removeAuthData } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpRedirect, setOtpRedirect] = useState(false);
  const navigate = useNavigate();

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

  const requestOtp = () => {
    setLoading(true);
    AuthService.requestOtp({ email: authData.user.email_usuario })
      .then(() => {
        sessionStorage.setItem("email_para_reset", authData.user.email_usuario);
        setOtpMessage(
          "Se ha enviado un código de verificación a tu mail para cambiar la contraseña."
        );
        setOtpRedirect(true);
      })
      .catch((error) => {
        setOtpMessage(
          error?.data?.message || error?.message || "Error al solicitar código"
        );
        setOtpRedirect(false);
      })
      .finally(() => {
        setLoading(false);
        setOtpDialogOpen(true);
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
            validatePattern=".{4,}"
            validationMessage="El nombre debe tener al menos 4 caracteres"
            required
          />
          <InputValidate
            id="email_usuario"
            type="email"
            labelText="Email"
            placeholder="Ingresa tu email"
            value={authData.user.email_usuario || ""}
            validationMessage="Email inválido"
            required
          />

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" className="w-full sm:w-auto">
              Guardar Cambios
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={requestOtp}
            >
              Cambiar Contraseña
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
      <SimpleDialog
        title="Recuperar contraseña"
        description={otpMessage}
        isOpen={otpDialogOpen}
        setIsOpen={(value) => {
          setOtpDialogOpen(value);
          if (!value && otpRedirect) {
            navigate("/auth/otpvalidation");
          }
        }}
      />
    </>
  );
}
