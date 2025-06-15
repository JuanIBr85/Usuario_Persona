
import { Fade } from "react-awesome-reveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading/Loading";
import { SimpleDialog } from "@/components/SimpleDialog";
import { useState } from "react";

function PerfilConnect() {
    const [loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState({title: '', description: ''});
    return (
        <>
            <SimpleDialog
                title={dialog?.title}
                description={dialog?.description}
                isOpen={dialog}
                setIsOpen={() => setDialog(null)} />
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

                            <CardContent className="h-full overflow-y-auto flex flex-col gap-8">
                                <InputValidate
                                    id="documento"
                                    type="text"
                                    labelText="Ingresa el número de documento"
                                    placeholder="Nº de documento"
                                    containerClassName="sm:col-span-3"
                                    required
                                />
                                <Button type="submit" className="w-full">
                                    Siguiente
                                </Button>
                            </CardContent>

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
