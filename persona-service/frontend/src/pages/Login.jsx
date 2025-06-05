import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from 'react-router-dom';
import { Fade } from "react-awesome-reveal";
import { KeyRound } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import { AuthService } from "@/services/authService";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/loading/Loading";

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
    <Fade duration={500} triggerOnce>
      
      <SimpleDialog
        title="Login"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        actionHandle={isLogin ? ()=>setTimeout(()=>navigate('/profile'), 200) : undefined}
      />
      <div className="h-screen flex items-center justify-center">
        <div className="flex w-full h-full sm:h-[520px] sm:max-w-md md:max-w-3xl shadow-md rounded-xl overflow-hidden">
          {/*Card informacion extra o algo para mostrar*/}
          <Card className="w-full md:max-w-md h-full bg-[var(--color-primario)] hidden md:block rounded-none">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full ">
              <KeyRound className="text-white w-42 h-42" />
            </CardContent>
            <CardFooter className="flex justify-center">
            </CardFooter>
          </Card>
          {/*Card Login*/}
          <Card className="w-full md:max-w-md h-full rounded-none">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Inicio de sesion
              </CardTitle>
            </CardHeader>
            <CardContent className=" h-full">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
                <InputValidate
                  id="email_usuario"
                  type="email"
                  placeholder="Email"
                  labelText="Email"
                  validateMessage="Email invalido"
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
                <Button variant="link" asChild><Link to="/forgotPassword">¿Olvidaste la contraseña?</Link></Button>
                <Button variant="link" asChild><Link to="/sign">¿No tiene una cuenta?</Link></Button>
                <Button type="submit">Iniciar sesion</Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center flex">
              <Button variant="link" ><Link to="termsofservice">Terminos de uso</Link></Button>
              <Button variant="link" ><Link to="privacypolicy">Politica de privacidad</Link></Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Fade>
    </>
    
  );
}

export default Login;
