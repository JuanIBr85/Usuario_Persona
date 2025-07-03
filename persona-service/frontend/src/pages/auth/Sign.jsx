// Importaciones de React y componentes del proyecto
import React from "react";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import { AuthService } from "@/services/authService";
import Loading from "@/components/loading/Loading";
import AuthLayout from "@/components/authLayout/AuthLayout";
import { useNavigate } from "react-router-dom";

/**
 * Componente: Sign
 * Permite crear una cuenta ingresando su email, nombre y contraseña.
 * Realiza validaciones de los campos, envía los datos al backend y redirige al login en caso de éxito.
 */

function Sign() {
  const [isOpen, setIsOpen] = React.useState(false); // Controla si el modal de feedback está abierto
  const [dialogMessage, setMessage] = React.useState(""); // Mensaje a mostrar en el modal
  const [isLoading, setIsLoading] = React.useState(false); // Estado de carga (spinner)
  const [isOK, setIsOK] = React.useState(false); // Indica si el registro fue exitoso
  const navigate = useNavigate(); // Utilizado para la redirección

  // Maneja el envío del formulario
  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event); // Convierte los datos del formulario a JSON
    document.activeElement.blur();
    setIsLoading(true);

    AuthService.register(formData) // Llama al servicio para registrar al usuario
      .then(() => {

        // Si fue exitoso, muestra mensaje de éxito y activa bandera isOK
        sessionStorage.setItem("email_verificar", formData.email_usuario);
        setMessage(
          `La cuenta ha sido creada correctamente. Por favor, ingrese el codigo que fue enviado a su mail para activar su cuenta.`
        );
        setIsOK(true);
      })
      .catch((error) => {
        setMessage(error.data?.message ?? "Ocurrió un error inesperado")
        setIsOK(false);
      })
      .finally(() => {
        setIsLoading(false);
        setIsOpen(true);
      });
  };

  return (
    <>
      {/* Spinner de carga mientras se realiza la solicitud */}
      {isLoading && <Loading isFixed={true} />}

      {/* Modal que muestra el resultado del registro */}
      <SimpleDialog
        title="Registro"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        actionHandle={
          isOK
            ? () => setTimeout(() => navigate("/auth/otpregister"), 500)
            : undefined
        } // Redirige al login si fue exitoso
      />

      {/* Layout del formulario de registro */}
      <AuthLayout
        title="Creación de cuenta"
        visualContent={<UserPlus className="text-white w-42 h-42" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          {/* Input de email */}
          <InputValidate
            id="email_usuario"
            type="email"
            placeholder="Email"
            labelText="Email"
            validationMessage="Email inválido"
            required
          />

          {/* Input de nombre de usuario con mínimo 4 caracteres */}
          <InputValidate
            id="nombre_usuario"
            type="text"
            placeholder="Nombre de usuario"
            labelText="Nombre"
            validatePattern=".{4,}"
            validationMessage="El nombre debe tener al menos 4 caracteres"
            required
          />

          {/* Input de contraseña con regex fuerte (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo) */}
          <InputValidate
            id="password"
            type="password"
            placeholder="Contraseña"
            labelText="Contraseña"
            validatePattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
            validationMessage="La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial."
            required
          />

          {/* Link para ir al login si ya tiene cuenta */}
          <Button variant="link" asChild className="p-0">
            <Link to="/auth/login">¿Ya tienes una cuenta? Inicia sesión</Link>
          </Button>

          <Button variant="link" asChild className="p-0">
            <Link to="/auth/login">¿Tiene un OTP de registro?</Link>
          </Button>

          {/* Botón de envío del formulario */}
          <Button type="submit" className="mt-4">
            Registrarse
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}

export default Sign;
