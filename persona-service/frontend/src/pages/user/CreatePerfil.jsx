import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/loading/Loading';
import { formJson } from '@/utils/formUtils';

// Importar componentes
import { ProgressBar } from '@/components/createProfile/ProgressBar';
import DatosPersonales from '@/components/createProfile/steps/DatosPersonales';
import Contacto from '@/components/createProfile/steps/Contacto';
import Domicilio from '@/components/createProfile/steps/Domicilio';
import InfoAdicional from '@/components/createProfile/steps/InfoAdicional';
import Resumen from '@/components/createProfile/steps/Resumen';

// Importar constantes
import { STEPS } from '@/components/createProfile/constants';


function CreatePerfil() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const refForm = useRef(null);
    const [newUser, setNewUser] = useState({});

    const handleSubmit = async () => {
        refForm.current.checkValidity();
        const formData = await formJson(refForm.current);

        const elements = Array
            .from(refForm.current.elements)
            .filter(element => element.checkValidity)
            .map(element => ({
                name: element.name,
                message: element.getAttribute('data-validation-message') || element.validationMessage
            }))
            .filter(element => element.message.length > 0)
            .reduce((acc, element) => {
                acc[element.name] = element.message;
                return acc;
            }, {});


        setNewUser({
            ...formData,
            ...elements
        });


        console.log({
            ...formData,
            ...elements
        });
    };

    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const renderStep = () => {
        return <>
            <DatosPersonales hidden={currentStep !== 0} />
            <Contacto hidden={currentStep !== 1} />
            <Domicilio hidden={currentStep !== 2} />
            <InfoAdicional hidden={currentStep !== 3} />
            <Resumen hidden={currentStep !== 4} newUser={newUser} />
        </>
    };

    return (
        <>
            {isLoading && <Loading isFixed={true} />}
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle>Completa tu perfil</CardTitle>
                        <CardDescription>
                            Por favor completa la siguiente información para crear tu perfil
                        </CardDescription>
                    </CardHeader>
                    {/*min-h-107 es un numero magico casi, se obtuvo calculando a ojo para que todo quede del mismo tamaño */}
                    <CardContent className="flex flex-col flex-1 min-h-107">
                        <form className="flex flex-col h-full" ref={refForm}>
                            <div className="space-y-8 flex-1">
                                <ProgressBar currentStep={currentStep} />
                                <div className="mb-6">
                                    {renderStep()}
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    {/* Navegación */}
                    <CardFooter className="border-t p-6">
                        <div className="w-full flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                            >
                                Anterior
                            </Button>
                            <Button
                                type={currentStep < 4 ? "button" : "submit"}
                                onClick={currentStep < 4 ? nextStep : handleSubmit}
                            >
                                {currentStep < 4 ? 'Siguiente' : 'Finalizar'}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
                {isLoading && <Loading isFixed={true} />}
            </div>
        </>
    );
}

export default CreatePerfil;
