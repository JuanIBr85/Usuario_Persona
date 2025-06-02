import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { KeyRound } from "lucide-react";
import { SimpleDialog } from "@/components/SimpleDialog";




function ForgotPassword() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogMessage, setMessage] = React.useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Enviando enlace de recuperación...");
  };

  return (
    <Fade duration={500} triggerOnce>
      <SimpleDialog
        title="Recuperar contraseña"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <div className="h-screen flex items-center justify-center">
        <div className="flex w-full h-full sm:h-[520px] sm:max-w-md md:max-w-3xl shadow-md rounded-xl overflow-hidden">
          {/* Card visual lado izquierdo */}
          <Card className="w-full md:max-w-md h-full bg-[var(--color-primario)] hidden md:block rounded-none">

            <CardContent className="flex items-center justify-center h-full">
              <KeyRound className="text-white w-42 h-42" />
            </CardContent>
            <CardFooter className="flex justify-center"></CardFooter>
          </Card>

          {/* Card Formulario */}
          <Card className="w-full md:max-w-md h-full rounded-none ">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                ¿Olvidaste tu contraseña?
              </CardTitle>
              <CardDescription className="text-center">
                Ingresa tu email para enviarte un enlace de recuperación.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
                <InputValidate
                  id="email_usuario"
                  type="email"
                  placeholder="Email"
                  labelText="Email"
                  validateMessage="Email inválido"
                  required
                />
                <Button type="submit">Enviar enlace</Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center flex gap-2">
              <Button variant="link" asChild><Link to="/login">Volver al inicio</Link></Button>
              <Button variant="link" asChild><Link to="/sign">Crear cuenta</Link></Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Fade>
  );
}

export default ForgotPassword;
