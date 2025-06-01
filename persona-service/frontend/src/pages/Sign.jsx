import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from 'react-router-dom';
import { Fade } from "react-awesome-reveal";
import { UserPlus } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";
import {SimpleDialog, FetchErrorMessage} from "@/components/SimpleDialog";

function Sign() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogMessage, setMessage] = React.useState("");

  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    fetchService.fetch({
      url: `${ServiceURL.auth}/registro1`,
      method: HttpMethod.POST,
      body: formData,
      showError: false
    }).then((json) => {
      console.log(json);
      setMessage(`La cuenta ha sido creada correctamente. Por favor, verifique su correo electrónico para activar su cuenta.`);
      setIsOpen(true);
    }).catch((error) => {
      if (error.isJson) {
        if(error.data.error){
          setMessage(FetchErrorMessage(error));
        }else{
          setMessage(error.data.message || "Error desconocido");
        }
      } else {
        setMessage(error.message);
      }

      setIsOpen(true);
    });
  }

  return (
    <Fade duration={500} triggerOnce>
      <SimpleDialog
        title="Registro"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
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
              <UserPlus className="text-white w-42 h-42" />
            </CardContent>
            <CardFooter className="flex justify-center">
            </CardFooter>
          </Card>
          {/*Card registro*/}
          <Card className="w-full md:max-w-md h-full rounded-none">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Creacion de cuenta
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
                  id="nombre_usuario"
                  type="text"
                  placeholder="Nombre de usuario"
                  labelText="Nombre"
                  validateMessage="El nombre es requerido"
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
                <Button variant="link" asChild><Link to="/login">¿Ya tiene una cuenta? Inicie sesión</Link></Button>
                <Button type="submit">Crear cuenta</Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center flex">
              <Button variant="link" ><Link to="/termsofservice">Terminos de uso</Link></Button>
              <Button variant="link" ><Link to="/privacypolicy">Politica de privacidad</Link></Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Fade>
  );
}

export default Sign