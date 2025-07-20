import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import { AuthService } from "@/services/authService";
import Loading from "@/components/loading/Loading";
import AuthLayout from "@/components/authLayout/AuthLayout";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

/**
 * OTPRegister.jsx
 *
 * Vista de verificación de correo electrónico mediante código OTP
 * enviada al usuario durante el proceso de registro.
 *
 * Este componente permite al usuario ingresar un código de verificación de 6 dígitos
 * enviado por email para completar su registro. Si el código no fue recibido, el usuario
 * puede solicitar el reenvío del mismo. Al validarse correctamente, se redirige al usuario
 * a la pantalla de login.
 *
 * Funcionalidades:
 * - Muestra un formulario para ingresar el código OTP.
 * - Permite reenviar el código OTP si no fue recibido.
 * - Muestra mensajes de éxito o error mediante un diálogo modal.
 * - Navega automáticamente tras una verificación exitosa.
 */

function OTPRegister() {
  // Hooks de navegación y estado
  const navigate = useNavigate();
  const location = useLocation();

  // Ruta a redirigir luego de una verificación exitosa
  const toRedirect = location.state?.from || "/auth/login";

  // Email guardado en sesión (usado para validar/verificar)
  const email = sessionStorage.getItem("email_verificar");

  // Estados para manejo del flujo
  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogMessage, setMessage] = React.useState("");
  const [isOK, setIsOK] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  /**
   * Solicita el reenvío del código OTP al correo electrónico del usuario.
   * Actualiza el estado con mensajes informativos o de error.
   */
  const handleResendOtp = async () => {
    console.log("Reenviando OTP a:", email);
    if (!email) return;
    setIsLoading(true);

    AuthService
      .resendOtp({ email })
      .then(() => {
        setMessage("Se ha reenviado el código al correo electrónico.");
        setIsOK(true);
        setShouldRedirect(false);
      })
      .catch((error) => {
        setIsOK(false);
        setMessage(
          error?.data?.message || error?.message || "No se pudo reenviar el código."
        );
      })
      .finally(() => {
        setIsLoading(false);
        setIsOpen(true);
      });
  };

  /**
   * Envía el código OTP ingresado por el usuario para validarlo.
   * Si es exitoso, se elimina el email de sesión y se redirige.
   */
  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setIsLoading(true);

    AuthService
      .verificarEmail({
        otp: formData.otp,
        email_usuario: email
      })
      .then(() => {

        setMessage("Se ha verificado correctamente el código de verificación.");
        sessionStorage.removeItem("email_verificar")
        setIsOK(true);
        setShouldRedirect(true);

      }).catch((error) => {
        console.log(error?.data);
        setIsOK(false);
        if (error.isJson) {
          if (error?.data?.error) {
            setMessage(FetchErrorMessage(error));
          } else {
            setMessage(error?.data?.message || "Error desconocido");
          }
        } else {
          setMessage(error.message);
        }
      }).finally(() => {
        setIsLoading(false);
        setIsOpen(true);
      });
  };

  return (
    <>
      {isLoading && <Loading isFixed={true} />}

      {/* Diálogo modal de confirmación o error */}
      <SimpleDialog
        title={isOK ? "Verificación exitosa" : "Error de verificación"}
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={(value) => {
          setIsOpen(value);
          if (!value && shouldRedirect) {
            navigate(toRedirect);
          }
        }}
      />

      {/* Layout principal de autenticación */}
      <AuthLayout
        title="Verificación de dos factores"
        visualContent={<ShieldCheck className="text-white w-56 h-56" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="otp">Código de verificación</Label>
            <div className="relative">
              <InputOTP name="otp" maxLength={6} containerClassName="justify-center">
                <InputOTPGroup>
                  <InputOTPSlot className="bg-gray-100" index={0} />
                  <InputOTPSlot className="bg-gray-100" index={1} />
                  <InputOTPSlot className="bg-gray-100" index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot className="bg-gray-100" index={3} />
                  <InputOTPSlot className="bg-gray-100" index={4} />
                  <InputOTPSlot className="bg-gray-100" index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {/* Enlace para reenviar el código */}
          <Button type="button" variant="link" className="p-0 mt-4" onClick={handleResendOtp}>
            ¿No te llegó el código? Reenviar
          </Button>

          {/* Botón para enviar el formulario */}
          <Button type="submit" className="mt-4">Validar</Button>
        </form>
      </AuthLayout>
    </>
  );
}

export default OTPRegister;