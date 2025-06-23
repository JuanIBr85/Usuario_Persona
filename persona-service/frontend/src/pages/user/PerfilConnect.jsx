
import { Fade } from "react-awesome-reveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading/Loading";
import { SimpleDialog } from "@/components/SimpleDialog";
import SimpleCarousel from "@/components/SimpleCarousel";
import { useEffect, useState } from "react";
import React from "react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { PersonaService } from "@/services/personaService";
import { formSubmitJson } from "@/utils/formUtils";
import SimpleSelect from "@/components/SimpleSelect";
import { SelectItem } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";


function PerfilConnect() {
    const [loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState(null);
    const [api, setApi] = useState();
    const [email, setEmail] = useState(null)
    const [tipoDocumento, setTipoDocumento] = useState([])
    const [tempData, setTempData] = useState({})

    const navigate = useNavigate();

    useEffect(() => {
        PersonaService.get_tipos_documentos()
            .then(response => {
                setTipoDocumento(response.data)
            })
            .catch(error => {
                console.log(error)
            })
    }, [])

    const handleDNIVerificacion = async (event) => {
        const formData = await formSubmitJson(event);
        setLoading(true);
        PersonaService.verificar_documento(formData)
            .then(response => {
                setEmail(response.data.email);
                setTempData(formData);
                api?.scrollNext()
            })
            .catch(error => {
                console.log(error)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    const handleEmailVerification = async (event) => {
        const formData = await formSubmitJson(event);
        setLoading(true);
        PersonaService.verificar_email({
            ...tempData,
            ...formData
        })
        .then(response => {
            setTempData({...response.data});
            api?.scrollNext()
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            setLoading(false)
        })
    }

    const handleOTPVerification = async (event) => {
        const formData = await formSubmitJson(event);
        setLoading(true);
        PersonaService.verificar_otp({
            ...tempData,
            ...formData
        })
        .then(response => {
            navigate('/profile')
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            setLoading(false)
        })
    }

    return (
        <>
            <SimpleDialog
                title={dialog?.title}
                description={dialog?.description}
                isOpen={dialog}
                setIsOpen={() => setDialog(null)}
                className="sm:max-w-3xl" />
            {loading && <Loading isFixed={true} />}
            <Fade duration={300} triggerOnce>
                <div className="w-full flex items-center justify-center sm:p-4" >
                    <div className="w-full h-full sm:h-auto md:max-w-2xl shadow-md rounded-xl overflow-hidden w-full flex items-center justify-center sm:p-4">
                        <Card className="w-full h-full rounded-xl">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">
                                    Vinculacion de perfil
                                </CardTitle>
                                <CardDescription>
                                    <p>Conecta tu perfil con tu cuenta de usuario</p>
                                    <p>Verificaremos si estas en el sistema</p>
                                </CardDescription>
                            </CardHeader>


                            <SimpleCarousel setApi={setApi}>
                                <CardContent className="h-full overflow-y-auto ">
                                    <form onSubmit={handleDNIVerificacion} className="flex flex-col gap-8">
                                        <SimpleSelect
                                            name="tipo_documento"
                                            label="Tipo de documento"
                                            placeholder="Selecciona un tipo de documento"
                                            required
                                        >
                                            {tipoDocumento.map((tipo) => (
                                            <SelectItem key={tipo} value={tipo}>
                                                {tipo}
                                            </SelectItem>
                                            ))}
                                        </SimpleSelect>
                                        <InputValidate
                                            id="num_doc_persona"
                                            type="number"
                                            labelText="Ingresa el número de documento"
                                            placeholder="Nº de documento"
                                            containerClassName="sm:col-span-3"
                                            required
                                        />
                                        <Button type="submit" className="w-full">
                                            Siguiente
                                        </Button>
                                    </form>
                                </CardContent>

                                <CardContent className="h-full overflow-y-auto">
                                <form onSubmit={handleEmailVerification} className="flex flex-col gap-4">
                                    <InputValidate
                                        type="text"
                                        labelText="¿Es este tu email?"
                                        value=""
                                        containerClassName="sm:col-span-3"
                                        readOnly
                                    />
                                    <InputValidate
                                        id="email_confirmado"
                                        type="text"
                                        labelText="Escribe tu email"
                                        placeholder={email}
                                        containerClassName="sm:col-span-3"
                                    />
                                    <Button type="submit" className="w-full">
                                        Siguiente
                                    </Button>
                                    <Button className="w-full" onClick={() => api?.scrollTo(3)}>
                                        No es mi correo / Ya no uso ese correo
                                    </Button>
                                    </form>
                                </CardContent>

                                <CardContent className="h-full overflow-y-auto flex flex-col gap-8">
                                    <form onSubmit={handleOTPVerification} className="grid w-full items-center justify-center gap-4">
                                        <Label htmlFor="codigo" className="inline-block w-full text-center">Código de verificación</Label>
                                        <div className="relative">
                                            <InputOTP name="codigo" maxLength={6} containerClassName="justify-center">
                                                <InputOTPGroup>
                                                    <InputOTPSlot className="bg-gray-100" index={0} />
                                                    <InputOTPSlot className="bg-gray-100" index={1} />
                                                    <InputOTPSlot className="bg-gray-100" index={2} />
                                                </InputOTPGroup>
                                                <InputOTPSeparator />
                                                <InputOTPGroup>
                                                    <InputOTPSlot className="bg-gray-100" index={3} />
                                                    <InputOTPSlot className="bg-gray-100" index={4} />
                                                    <InputOTPSlot className="bg-gray-100" index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                        <Button type="submit" className="w-full">
                                            Siguiente
                                        </Button>
                                    </form>
                                </CardContent>

                                <CardContent className="h-full overflow-y-auto flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                        <InputValidate
                                            id="nombre_persona"
                                            type="text"
                                            labelText="Nombre"
                                        />
                                        <InputValidate
                                            id="apellido_persona"
                                            type="text"
                                            labelText="Apellido"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                        <InputValidate
                                            id="fecha_nacimiento_persona"
                                            type="date"
                                            placeholder="Ingresa tu fecha de nacimiento"
                                            labelText="Fecha de nacimiento"
                                            validateMessage="La fecha de nacimiento es requerida"
                                            required
                                        />
                                        <InputValidate
                                            id="telefono_movil"
                                            name="telefono_movil"
                                            type="tel"
                                            placeholder="Ingresa tu teléfono móvil"
                                            labelText="Teléfono móvil"
                                            validatePattern="^[\+]?[0-9\-\s\(\)]{10,}$"
                                            validateMessage="Ingresa un número de teléfono válido"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" onClick={() => setDialog({
                                        title: "Verificar identidad",
                                        description: <>
                                            Tus datos concuerdan, enviaremos una peticion de verificacion al administrador, te contactaremos pronto
                                            <br />
                                            En caso de no ser contactado, puedes contactarnos al correo <a className="text-blue-500" href="mailto:soporte@persona.com">soporte@persona.com</a>
                                            <br />
                                            o llamar al numero <a className="text-blue-500" href="tel:+56912345678">+56912345678</a>
                                        </>
                                    })}>
                                        Verificar identidad
                                    </Button>
                                </CardContent>
                            </SimpleCarousel>

                            <CardFooter className="flex justify-between text-sm text-gray-500 border-t">
                            </CardFooter>

                        </Card>
                    </div>
                </div>
            </Fade>
        </>
    );
}

export default PerfilConnect;
