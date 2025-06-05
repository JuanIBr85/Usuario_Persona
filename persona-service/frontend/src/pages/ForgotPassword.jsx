import React from "react";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from 'react-router-dom';
import { KeyRound, Mail } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import { AuthService } from "@/services/authService";
import Loading from "@/components/loading/Loading";
import AuthLayout from "@/components/authLayout/AuthLayout";

function ForgotPassword() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogMessage, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setIsLoading(true);
    
    AuthService
      .forgotPassword(formData)
      .then(() => {
        setMessage("Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.");
        setIsOpen(true);
      })
      .catch((error) => {
        if (error.isJson) {
          if (error.data.error) {
            setMessage(FetchErrorMessage(error));
          } else {
            setMessage(error.data.message || "Error al procesar la solicitud");
          }
        } else {
          setMessage(error.message || "Error de conexión");
        }
        setIsOpen(true);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      {isLoading && <Loading isFixed={true} />}
      <SimpleDialog
        title="Recuperar contraseña"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <AuthLayout
        title="Recuperar contraseña"
        visualContent={<Mail className="text-white w-42 h-42" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          <p className="text-sm text-muted-foreground">
            Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          <InputValidate
            id="email_usuario"
            type="email"
            placeholder="Email"
            labelText="Email"
            validateMessage="Email inválido"
            required
          />
          <Button variant="link" asChild className="p-0">
            <Link to="/login">¿Ya tienes una cuenta? Inicia sesión</Link>
          </Button>
          <Button variant="link" asChild className="p-0">
            <Link to="/sign">¿No tienes una cuenta? Regístrate</Link>
          </Button>
          <Button type="submit" className="mt-4">Enviar enlace</Button>

        </form>
      </AuthLayout>
    </>
  );
}

export default ForgotPassword;
