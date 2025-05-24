import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from 'react-router-dom';

function Sign() {
  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center">
      <div className="flex w-full h-full sm:h-[520px] sm:max-w-md md:max-w-3xl shadow-md rounded-xl overflow-hidden">
        
        {/*Card informacion extra o algo para mostrar*/}
        <Card className="w-full md:max-w-md h-full bg-blue-600 hidden md:block rounded-none">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
            </CardTitle>
          </CardHeader>
          <CardContent className=" h-full">
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
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 h-full">
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
            <Button variant="link" asChild><Link to="*">Termino de uso</Link></Button>
            |
            <Button variant="link" asChild><Link to="*">Politica de privacidad</Link></Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Sign