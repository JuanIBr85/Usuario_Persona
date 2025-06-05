import React from "react";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from 'react-router-dom';
import { KeyRound } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import { AuthService } from "@/services/authService";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/loading/Loading";
import AuthLayout from "@/components/authLayout/AuthLayout";

function Login() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogMessage, setMessage] = React.useState("");
  const [isLogin, setIsLogin] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);  
  const {updateData} = useAuthContext();

  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setIsLoading(true);
    AuthService
      .login(formData)
      .then((json) => {
        setMessage(`Login exitoso. Bienvenido ${json.data.usuario.nombre_usuario}!`);
        setIsLogin(true);
        updateData({
          token: json.data.token,
          user: json.data.usuario
        });
        setIsOpen(true);
      }).catch((error) => {

        if (error.isJson) {
          if (error.data.error) {
            setMessage(FetchErrorMessage(error));
          } else {
            setMessage(error.data.message || "Error desconocido");
          }
        } else {
          setMessage(error.message);
        }
        setIsOpen(true);
      }).finally(()=>setIsLoading(false));
  }
  return (
    <>
      {isLoading && <Loading isFixed={true}/>}
      <SimpleDialog
        title="Login"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        actionHandle={isLogin ? ()=>setTimeout(()=>navigate('/profile'), 200) : undefined}
      />
      
      <AuthLayout
        title="Inicio de sesión"
        visualContent={<KeyRound className="text-white w-42 h-42" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          <InputValidate
            id="email_usuario"
            type="email"
            placeholder="Email"
            labelText="Email"
            validateMessage="Email inválido"
            required
          />
          <InputValidate
            id="password"
            type="password"
            placeholder="Contraseña"
            labelText="Contraseña"
            validatePattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
            validateMessage="La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial."
            required
          />
          <Button variant="link" asChild className="p-0">
            <Link to="/forgotPassword">¿Olvidaste la contraseña?</Link>
          </Button>
          <Button variant="link" asChild className="p-0">
            <Link to="/sign">¿No tienes una cuenta? Regístrate</Link>
          </Button>
          <Button type="submit" className="mt-4">Iniciar sesión</Button>
        </form>
      </AuthLayout>
    </>
    
  );
}

export default Login;
