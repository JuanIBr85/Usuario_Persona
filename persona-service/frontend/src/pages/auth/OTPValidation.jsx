import React, { useEffect } from "react";
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
 * OTPValidation.jsx
 *
 * Vista encargada de validar un código OTP enviado por email,
 * como parte del flujo de recuperación de contraseña.
 *
 * Funcionalidades:
 * - Recupera el email del usuario desde `sessionStorage`.
 * - Permite ingresar un código OTP de 6 dígitos.
 * - Realiza una verificación contra el backend.
 * - En caso exitoso, almacena el `reset_token` para el siguiente paso (resetear la contraseña).
 * - Permite reenviar el código OTP al correo.
 * - Muestra un diálogo de éxito o error según el resultado.
 * - Redirige al formulario de restablecer contraseña si la validación fue exitosa.
 *
 * Si no hay email guardado en sessionStorage (`email_para_reset`), redirige automáticamente al login.
 */

function OTPValidation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ruta a redirigir luego de la validación exitosa
  const toRedirect = location.state?.from || "/auth/resetpassword";

  // Email obtenido desde sessionStorage
  const email = sessionStorage.getItem("email_para_reset");

  // Estados locales para manejar el flujo
  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogMessage, setMessage] = React.useState("");
  const [isOK, setIsOK] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  /**
   * useEffect que redirige al login si no hay email en sessionStorage.
   */
  useEffect(() => {
    if (!email) {
      navigate("/auth/login");
    }
  }, [email, navigate]);

  /**
   * Maneja el reenvío del código OTP al correo almacenado.
   */
  const handleResendOtp = async () => {

    console.log("Reenviando OTP a:", email);
    if (!email) return;

    setIsLoading(true);

    AuthService
      .requestOtp({ email })
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
   * Maneja el envío del formulario de validación OTP.
   * Si es exitoso, guarda el `reset_token` y redirige al formulario de cambio de contraseña.
   */
  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setIsLoading(true);

    AuthService
      .validateOtp({
        otp: formData.otp,
        email: email
      })
      .then((json) => {
        const token = json.data?.reset_token;
        if (token) {
          sessionStorage.setItem("reset_token", token); // Guardamos el token para usarlo después
          sessionStorage.setItem("email_para_reset", email); // Guardamos el email para usarlo después
          setMessage("Se ha verificado correctamente el código de verificación.");
          setIsOK(true);
          setShouldRedirect(true);
        } else {
          setMessage("No se recibió el token de verificación.");
          setIsOK(false);
        }
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
      {/* Spinner de carga */}
      {isLoading && <Loading isFixed={true} />}

      {/* Diálogo con mensaje de éxito o error */}
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

      {/* Layout con formulario de validación */}
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

          {/* Enlace para reenviar OTP */}
          <Button type="button" variant="link" className="p-0 mt-4" onClick={handleResendOtp}>
            ¿No te llegó el código? Reenviar
          </Button>

          {/* Botón de envío */}
          <Button type="submit" className="mt-4">Validar</Button>
        </form>
      </AuthLayout>
    </>
  );
}

export default OTPValidation;