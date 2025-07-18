import React from "react";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import { AuthService } from "@/services/authService";
import Loading from "@/components/loading/Loading";
import AuthLayout from "@/components/authLayout/AuthLayout";

/**
 * ForgotPassword.jsx
 *
 * Permite al usuario iniciar el proceso de recuperación de contraseña
 * ingresando su correo electrónico. Luego, el sistema enviará un código
 * de verificación por email si el correo es válido.
 *
 * Flujo:
 * - El usuario envía su email.
 * - Se hace un request al backend (`AuthService.requestOtp`).
 * - Si es exitoso, se guarda el email en `sessionStorage` y se redirige a la validación del OTP.
 * - Si hay un error, se muestra un mensaje con `SimpleDialog`.
 *
 */
function ForgotPassword() {
  const [isOpen, setIsOpen] = React.useState(false);         // Controla la visibilidad del modal
  const [dialogMessage, setMessage] = React.useState("");    // Mensaje mostrado en el modal
  const [isLoading, setIsLoading] = React.useState(false);   // Controla el spinner de carga
  const [shouldRedirect, setShouldRedirect] = React.useState(false); // Si debe redirigir después del cierre del modal
  const navigate = useNavigate(); // Hook para navegación

  /**
   * Maneja el envío del formulario.
   * Realiza una solicitud al backend para enviar el OTP al email ingresado.
   */
  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event); // Extrae y serializa los datos del formulario
    document.activeElement.blur();
    setIsLoading(true); // Muestra el spinner

    AuthService
      .requestOtp(formData) // Llama al endpoint de OTP
      .then((json) => {
        sessionStorage.setItem("email_para_reset", formData.email); // Guarda el email temporalmente
        setMessage("Se ha enviado un codigo de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.");
        setShouldRedirect(true); // Prepara para redirigir
      })
      .catch((error) => {
        setShouldRedirect(false); // Cancela redirección si hay error
        if (error.isJson) {
          // Si el backend devuelve un mensaje específico
          if (error.data.error) {
            setMessage(FetchErrorMessage(error)); // Usa mensaje estandarizado
          } else {
            setMessage(error.data.message || "Error al procesar la solicitud");
          }
        } else {
          setMessage(error.message || "Error de conexión");
        }

      })
      .finally(() => { setIsLoading(false); setIsOpen(true); });
  };

  return (
    <>
      {/* Spinner de carga mientras se espera la respuesta */}
      {isLoading && <Loading isFixed={true} />}

      {/* Modal de resultado (éxito o error) */}
      <SimpleDialog
        title="Recuperar contraseña"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={(value) => {
          setIsOpen(value);
          if (!value && shouldRedirect) {
            navigate("/auth/otpvalidation"); // Redirección al cerrar el modal si fue exitoso
          }
        }}
      />

      {/* Layout de autenticación con formulario */}
      <AuthLayout
        title="Recuperar contraseña"
        visualContent={<Mail className="text-white w-42 h-42" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          <p className="text-sm text-muted-foreground">
            Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {/* Campo de email validado */}
          <InputValidate
            id="email"
            type="email"
            placeholder="Email"
            maxLength={50}
            labelText="Email"
            validationMessage="Email inválido"
            required
          />

          {/* Links de navegación */}
          <Button variant="link" asChild className="p-0">
            <Link to="/auth/login">¿Ya tienes una cuenta? Inicia sesión</Link>
          </Button>
          <Button variant="link" asChild className="p-0">
            <Link to="/auth/sign">¿No tienes una cuenta? Regístrate</Link>
          </Button>

          {/* Botón para enviar el formulario */}
          <Button type="submit" className="mt-4">Solicitar cambio de contraseña</Button>

        </form>
      </AuthLayout>
    </>
  );
}

export default ForgotPassword;