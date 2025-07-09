import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { SimpleDialog } from "@/components/SimpleDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [emailResultOpen, setEmailResultOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [openUsernameDialog, setOpenUsernameDialog] = useState(false);
  const [usernameResultOpen, setUsernameResultOpen] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
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

  const submitChangeEmail = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setLoading(true);
    AuthService.changeEmail({ nuevo_email: formData.nuevo_email, password: formData.password })
      .then(() => {
        setEmailMessage("Se ha enviado un correo de confirmación al nuevo email.");
      })
      .catch((error) => {
        setEmailMessage(error?.data?.message || error?.message || "Error al solicitar cambio de correo");
      })
      .finally(() => {
        setLoading(false);
        setOpenEmailDialog(false);
        setEmailResultOpen(true);
      });
  };

  const submitChangeUsername = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setLoading(true);
    AuthService.changeUsername({ nombre_usuario: formData.nombre_usuario })
      .then((response) => {
        updateData({ user: { ...authData.user, ...response.data } });
        setUsernameMessage("Nombre de usuario actualizado correctamente.");
      })
      .catch((error) => {
        setUsernameMessage(
          error?.data?.message || error?.message || "Error al cambiar nombre de usuario"
        );
      })
      .finally(() => {
        setLoading(false);
        setOpenUsernameDialog(false);
        setUsernameResultOpen(true);
      });
  };



  return (
    <>
      {loading && <Loading isFixed={true} />}

      <div className="w-full max-w-md mx-auto space-y-4 px-4">
        <form onSubmit={handleSubmit} className="space-y-4">


          <div className="flex flex-col gap-3 pt-4">

            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={requestOtp}
            >
              Cambiar Contraseña
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setOpenUsernameDialog(true)}
            >
              Cambiar Nombre de Usuario
            </Button>

            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setOpenEmailDialog(true)}
            >
              Cambiar Correo
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
      <AlertDialog open={openUsernameDialog} onOpenChange={setOpenUsernameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar nombre de usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Ingresa el nuevo nombre de usuario
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={submitChangeUsername} className="space-y-4">
            <InputValidate
              id="nombre_usuario"
              type="text"
              labelText="Nuevo nombre"
              placeholder="Ingresa el nuevo nombre"
              validatePattern=".{4,}"
              validationMessage="El nombre debe tener al menos 4 caracteres"
              required
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction type="submit">Enviar</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openEmailDialog} onOpenChange={setOpenEmailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar correo</AlertDialogTitle>
            <AlertDialogDescription>
              Ingresa tu contraseña y el nuevo correo
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={submitChangeEmail} className="space-y-4">
            <InputValidate
              id="nuevo_email"
              type="email"
              labelText="Nuevo correo"
              placeholder="Ingresa tu nuevo correo"
              value={authData.user.email_usuario || ""}
              validationMessage="Email inválido"
              required
            />
            <InputValidate
              id="password"
              type="password"
              labelText="Contraseña"
              placeholder="Ingresa tu contraseña"
              required
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction type="submit">Enviar</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      <SimpleDialog
        title="Cambio de nombre de usuario"
        description={usernameMessage}
        isOpen={usernameResultOpen}
        actionHandle={() => setUsernameResultOpen(false)}
      />

      <SimpleDialog
        title="Cambio de correo"
        description={emailMessage}
        isOpen={emailResultOpen}
        actionHandle={() => setEmailResultOpen(false)}
      />
    </>
  );
}
