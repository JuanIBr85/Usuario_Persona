import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from 'react-router-dom';
import { Fade } from "react-awesome-reveal";
import { KeyRound } from "lucide-react";

function Login() {
    return (
        <Fade duration={500} triggerOnce>
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
                                    id="password"
                                    type="password"
                                    placeholder="Contraseña"
                                    labelText="Contraseña"
                                    validatePattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
                                    validateMessage="La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial."
                                    required
                                />
                                <Button variant="link" asChild><Link to="*">¿Olvidaste la contraseña?</Link></Button>
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
    );
}

export default Login;
