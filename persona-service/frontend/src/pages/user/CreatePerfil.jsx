import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/loading/Loading';
import { PersonaService } from "@/services/personaService";

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
    
    
    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0: // Datos personales
                return <DatosPersonales />;
            case 1: // Contacto
                return <Contacto />;
            case 2: // Domicilio
                return <Domicilio />;
            case 3: // Información adicional
                return <InfoAdicional />;
            case 4: // Resumen
                return <Resumen />;
            default:
                return null;
        }
    };

    return (
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
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loading />
                        </div>
                    ) : (
                        <form className="flex flex-col h-full" onSubmit={()=>{}}>
                            <div className="space-y-8 flex-1">
                                <ProgressBar currentStep={currentStep} />
                                {/* Contenido del paso actual */}
                                <div className="mb-6">
                                    {renderStep()}
                                </div>
                            </div>
                        </form>
                    )}
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
                            onClick={currentStep < 4 ? nextStep : null}
                        >
                            {currentStep < 4 ? 'Siguiente' : 'Finalizar'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
            {isLoading && <Loading isFixed={true} />}
        </div>
    );
}

export default CreatePerfil;
