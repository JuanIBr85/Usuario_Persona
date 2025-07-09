import { useState } from "react";
import { useNavigate } from "react-router-dom";

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



export default function FormUsuario() {

  const { authData, updateData } = useAuthContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteResultOpen, setDeleteResultOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [redirectToOtp, setRedirectToOtp] = useState(false);

  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [emailResultOpen, setEmailResultOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  const [openUsernameDialog, setOpenUsernameDialog] = useState(false);
  const [usernameResultOpen, setUsernameResultOpen] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");


  const submitDeleteRequest = async (event) => {
    const formData = await formSubmitJson(event);
    setLoading(true);
    AuthService.requestDelete({
      email: formData.email,
      password: formData.password,
    })
      .then(() =>
        setDeleteMessage(
          "Se envió un correo de confirmación para eliminar la cuenta."
        )
      )
      .catch((error) =>
        setDeleteMessage(
          error?.data?.message || error?.message || "Error al solicitar eliminación"
        )
      )
      .finally(() => {
        setLoading(false);
        setOpenDeleteDialog(false);
        setDeleteResultOpen(true);
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
        setRedirectToOtp(true);
      })
      .catch((error) => {
        setOtpMessage(
          error?.data?.message || error?.message || "Error al solicitar código"
        );
        setRedirectToOtp(false);
      })
      .finally(() => {
        setLoading(false);
        setOtpDialogOpen(true);
      });
  };

  const submitChangeEmail = async (event) => {
    const formData = await formSubmitJson(event);
    setLoading(true);
    AuthService.changeEmail({
      nuevo_email: formData.nuevo_email,
      password: formData.password,
    })
      .then(() =>
        setEmailMessage(
          "Se ha enviado un correo de confirmación al nuevo email."
        )
      )
      .catch((error) =>
        setEmailMessage(
          error?.data?.message || error?.message || "Error al cambiar correo"
        )
      )
      .finally(() => {
        setLoading(false);
        setOpenEmailDialog(false);
        setEmailResultOpen(true);
      });
  };

  const submitChangeUsername = async (event) => {
    const formData = await formSubmitJson(event);
    setLoading(true);
    AuthService.changeUsername({ nombre_usuario: formData.nombre_usuario })
      .then((response) => {
        updateData({ user: { ...authData.user, ...response.data } });
        setUsernameMessage("Nombre de usuario actualizado correctamente.");
      })
      .catch((error) =>
        setUsernameMessage(
          error?.data?.message || error?.message || "Error al cambiar nombre"
        )
      )
      .finally(() => {
        setLoading(false);
        setOpenUsernameDialog(false);
        setUsernameResultOpen(true);
      });
  };



  return (
    <>
      {loading && <Loading isFixed />}

      <div className="w-full max-w-md mx-auto space-y-4 px-4">
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={requestOtp}>Cambiar Contraseña</Button>

          <Button onClick={() => setOpenUsernameDialog(true)}>
            Cambiar Nombre de Usuario
          </Button>

          <Button onClick={() => setOpenEmailDialog(true)}>
            Cambiar Correo
          </Button>

          <Button
            variant="destructive"
            onClick={() => setOpenDeleteDialog(true)}
          >
            Eliminar Cuenta
          </Button>
        </div>
      </div>

      {/* ─────────── Diálogos ─────────── */}

      {/* error genérico */}
      <SimpleDialog
        title="Ocurrió un error"
        description="No se pudieron completar la acción. Intenta nuevamente."
        isOpen={openDialog}
        action="Cerrar"
        actionHandle={() => setOpenDialog(false)}
      />

      {/* eliminar cuenta */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cuenta</AlertDialogTitle>
            <AlertDialogDescription>
              Ingresá tu correo y contraseña para confirmar la eliminación
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={submitDeleteRequest} className="space-y-4">
            <InputValidate
              id="email"
              type="email"
              labelText="Correo"
              placeholder="Ingresa tu correo"
              defaultValue={authData.user.email_usuario || ""}
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

      {/* OTP / cambio de contraseña */}
      <SimpleDialog
        title="Recuperar contraseña"
        description={otpMessage}
        isOpen={otpDialogOpen}
        setIsOpen={(value) => {
          setOtpDialogOpen(value);
          if (!value && redirectToOtp) navigate("/auth/otpvalidation");
        }}
      />

      {/* dialogo nombre de usuario */}
      <AlertDialog
        open={openUsernameDialog}
        onOpenChange={setOpenUsernameDialog}
      >
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

      {/* dialogo cambiar correo */}
      <AlertDialog
        open={openEmailDialog}
        onOpenChange={setOpenEmailDialog}
      >
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
              defaultValue={authData.user.email_usuario || ""}
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

      {/* resultados */}
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
      <SimpleDialog
        title="Eliminar cuenta"
        description={deleteMessage}
        isOpen={deleteResultOpen}
        actionHandle={() => setDeleteResultOpen(false)}
      />

    </>
  );
}
