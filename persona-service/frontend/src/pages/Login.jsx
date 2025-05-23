import React from "react";
import { Card,CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from 'react-router-dom';



const messagePasswordError = "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial."

function Login() {
  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center">
      <div className="flex w-full h-full sm:h-[480px] sm:max-w-md md:max-w-3xl shadow-md rounded-xl overflow-hidden">
        <div className="w-full h-full bg-blue-600 hidden md:block"></div>
        <Card className="w-full md:max-w-md h-full rounded-none">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Inicio de sesion
            </CardTitle>
          </CardHeader>
          <CardContent className=" h-full">
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 h-full">
              <InputValidate
                id="email"
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
                title={messagePasswordError}
                validateMessage={messagePasswordError}
                required
              />
              <Button variant="link" asChild><Link to="*">¿Olvidaste la contraseña?</Link></Button>
              <Button variant="link" asChild><Link to="/sign">¿No tiene una cuenta?</Link></Button>
              <Button type="submit" className="mt-auto">Iniciar sesion</Button>
            </form>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Login;
