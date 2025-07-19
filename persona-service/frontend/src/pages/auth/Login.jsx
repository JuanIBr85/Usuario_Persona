// Importaciones de React y componentes del proyecto
import React from "react";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import { AuthService } from "@/services/authService";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/loading/Loading";
import AuthLayout from "@/components/authLayout/AuthLayout";
import useFetchMessage from "@/utils/useFetchMessage";

/**
 * Componente: Login.
 * Permite al usuario autenticarse ingresando su correo y contraseña.
 * Si el login es exitoso, se guarda el token y datos del usuario en el contexto global.
 */
function Login() {
  const navigate = useNavigate(); // Para redirigir luego del login
  const [isOpen, setIsOpen] = React.useState(false); // Controla visibilidad del diálogo
  const [dialogMessage, setMessage] = React.useState(""); // Mensaje que se mostrará en el diálogo
  const [isLogin, setIsLogin] = React.useState(false); // Indica si el login fue exitoso
  const [isLoading, setIsLoading] = React.useState(false); // Estado de carga (spinner)
  const { updateData } = useAuthContext(); // Función del contexto global para guardar datos del usuario
  //Compruebo si tiene un otp
  const [hasResetEmail, setHasResetEmail] = React.useState(sessionStorage.getItem("email_verificar") !== null);
  /**
   * Maneja el envío del formulario de login.
   * Realiza la autenticación contra el backend usando AuthService.
   * Muestra un diálogo con el resultado (éxito o error).
   */
  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event); // Convierte los datos del formulario a JSON
    document.activeElement.blur();
    setIsLoading(true);

    AuthService.login(formData) // Envia los datos al backend para autenticar
      .then((json) => {
        // Si es exitoso, se muestra un mensaje y se actualiza el contexto global
        setMessage(`Login exitoso. ¡Bienvenido ${json.data.nombre_usuario}!`);
        setIsLogin(true);
        updateData({
          token: json.data.token, // Guarda el token para futuras peticiones
          user: json.data, // Guarda los datos del usuario logueado
        });
      })
      .catch((error) => {
        if (error.isJson) {
          // Si el backend devuelve un mensaje específico
          if (error?.data?.error) {
            console.log(error?.data);
            setMessage(FetchErrorMessage(error)); // Usa mensaje estandarizado
          } else {
            setMessage(error?.data?.message || "Error al procesar la solicitud");
          }
        } else {
          setMessage(error.message || "Error de conexión");
        }
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

      {/* Diálogo emergente con el mensaje de login (éxito o error) */}
      <SimpleDialog
        title="Login"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        actionHandle={
          isLogin
            ? () => setTimeout(() => navigate("/searchprofile"), 1000)
            : undefined
        }
      // Si el login fue exitoso, redirige al perfil después de cerrar el diálogo
      />

      {/* Layout visual general del formulario de login */}
      <AuthLayout
        title="Inicio de sesión"
        visualContent={<KeyRound className="text-white w-42 h-42" />}
      >
        {/* Formulario de login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          {/* Campo para ingresar el email */}
          <InputValidate
            id="email_usuario"
            type="email"
            placeholder="Email"
            maxLength={50}
            labelText="Email"
            validationMessage="Email inválido"
            
            required
          />

          {/* Campo para ingresar la contraseña con validación de seguridad */}
          <InputValidate
            id="password"
            type="password"
            isCleanValue={false}
            placeholder="Contraseña"
            maxLength={70}
            labelText="Contraseña"
            validatePattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
            validationMessage="La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial."
            required
          />

          {/* Enlace a recuperación de contraseña */}
          <Button variant="link" asChild className="p-0">
            <Link to="/auth/forgotPassword">¿Olvidaste la contraseña?</Link>
          </Button>

          {/* Enlace para registrarse si no tiene cuenta */}

          {hasResetEmail &&
            <Button variant="link" asChild className="p-0">
              <Link to="/auth/otpregister">¿Posee un codigo OTP?</Link>
            </Button>}

          {/* Enlace para registrarse si no tiene cuenta */}
          <Button variant="link" asChild className="p-0">
            <Link to="/auth/sign">¿No tienes una cuenta? Regístrate</Link>
          </Button>

          {/* Botón para enviar el formulario */}
          <Button type="submit" className="mt-4">
            Iniciar sesión
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}

export default Login;
