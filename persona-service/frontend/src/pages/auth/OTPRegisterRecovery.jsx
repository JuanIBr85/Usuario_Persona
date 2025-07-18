import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { formSubmitJson, formJson } from "@/utils/formUtils";
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
import InputValidate from "@/components/inputValidate/InputValidate";
import { useRef } from "react";

/**
 * OTPRegisterRecovery.jsx
 *
 * Vista para validar el código OTP enviado al correo electrónico
 * de un usuario que ha solicitado la verificación por recuperación, sin depender del
 * `sessionStorage`.
 * 
 *
 * Funcionalidades:
 * - Permite ingresar el email y el código OTP manualmente.
 * - Verifica el código ingresado y muestra resultado mediante diálogo modal.
 * - Permite reenviar el código OTP.
 * - Redirige al login en caso de éxito.
 *
 */

function OTPRegisterRecovery() {
  const navigate = useNavigate();
  const location = useLocation();

  // Destino post-verificación (login)
  const toRedirect = location.state?.from || "/auth/login";

  // Referencia al formulario para acceder a los valores sin evento submit
  const formRef = useRef(null);

  // Estado del componente
  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogMessage, setMessage] = React.useState("");
  const [isOK, setIsOK] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  /**
   * Reenvía el código OTP al correo ingresado en el formulario.
   * Usa `formRef` para extraer el email sin necesidad de un submit.
   */
  const handleResendOtp = async () => {
    const formData = await formJson(formRef.current);
    const email = formData.email_usuario;

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
   * Envía el formulario para verificar el código OTP y el correo.
   * En caso de éxito, redirige al login.
   */
  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setIsLoading(true);

    AuthService
      .verificarEmail({
        otp: formData.otp,
        email_usuario: formData.email_usuario
      })
      .then(() => {
        setMessage("Se ha verificado correctamente el código de verificación.");
        sessionStorage.removeItem("email_verificar")
        setIsOK(true);
        setShouldRedirect(true);

      }).catch((error) => {
        console.log(error.data);
        setIsOK(false);
        if (error.isJson) {
          if (error.data.error) {
            setMessage(FetchErrorMessage(error));
          } else {
            setMessage(error.data.message || "Error desconocido");
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
      {/* Spinner de carga */}
      {isLoading && <Loading isFixed={true} />}

      {/* Modal de éxito o error */}
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

      {/* Layout con ícono y título */}
      <AuthLayout
        title="Verificación de dos factores"
        visualContent={<ShieldCheck className="text-white w-42 h-42" />}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          {/* Campo OTP */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="otp">Código de verificación <span className="text-destructive">*</span></Label>
            <div className="relative">
              <InputOTP name="otp" maxLength={6} containerClassName="justify-center" required>
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

          {/* Campo Email */}
          <InputValidate
            id="email_usuario"
            type="email"
            placeholder="Email"
            maxLength={50}
            labelText="Email"
            validationMessage="Email inválido"
            required
          />

          {/* Reenviar código */}
          <Button type="button" variant="link" className="p-0 mt-4" onClick={handleResendOtp}>
            ¿No te llegó el código? Reenviar
          </Button>

          {/* Enlace para registrarse si no tiene cuenta */}
          <Button variant="link" asChild className="p-0">
            <Link to="/auth/sign">¿No tienes una cuenta? Regístrate</Link>
          </Button>

          {/* Enviar formulario */}
          <Button type="submit" className="mt-4">Validar</Button>
        </form>
      </AuthLayout>
    </>
  );
}

export default OTPRegisterRecovery;