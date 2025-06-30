import React, { useRef, useState, useEffect } from 'react';
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

const PERSONA_DEFAULT = {
    "nombre_persona": undefined,
    "apellido_persona": undefined,
    "fecha_nacimiento_persona": undefined,
    "tipo_documento": undefined,
    "num_doc_persona": undefined,
    "domicilio": {
        "domicilio_calle": undefined,
        "domicilio_numero": undefined,
        "domicilio_piso": undefined,
        "domicilio_dpto": undefined,
        "domicilio_referencia": undefined,
        "codigo_postal": {
            "codigo_postal": undefined,
            "localidad": undefined
        }
    },
    "contacto": {
        "telefono_fijo": undefined,
        "telefono_movil": undefined,
        "red_social_contacto": undefined,
        "red_social_nombre": null,
        "email_contacto": undefined,
        "observacion_contacto": undefined
    },
    "persona_extendida": {
        "estado_civil": undefined,
        "ocupacion": undefined,
        "estudios_alcanzados": undefined,
        "vencimiento_dni": undefined,
        "foto_perfil": undefined
    }
};

function CreatePerfil() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const refForm = useRef(null);
    const [newUser, setNewUser] = useState({});

    const handleCheckResumen = async () => {
        refForm.current.checkValidity();
        const formData = await formJson(refForm.current);

        //Filtro los elementos que no son validos
        const elements = Array
            .from(refForm.current.elements)
            .filter(element => element.checkValidity && !element.checkValidity())
            .map(element => ({
                name: element.name,
                message: element.getAttribute('data-validation-message') || element.validationMessage
            }))
            .reduce((acc, element) => {
                //Preparo el json con los datos erroneos
                acc[element.name] = <span className="text-destructive">{element.message}</span>;
                return acc;
            }, {});


        const data = {
            ...formData,
            ...elements
        };

        Object.keys(data).forEach(key => {
            if (data[key] === "") {
                data[key] = undefined;
            }
        });

        // Estructurar los datos según el formato de PERSONA_DEFAULT
        const structuredData = {
            nombre_persona: data.nombre_persona,
            apellido_persona: data.apellido_persona,
            fecha_nacimiento_persona: data.fecha_nacimiento_persona,
            tipo_documento: data.tipo_documento,
            num_doc_persona: data.num_doc_persona,
            domicilio: {
                domicilio_calle: data.domicilio_calle,
                domicilio_numero: data.domicilio_numero,
                domicilio_piso: data.domicilio_piso,
                domicilio_dpto: data.domicilio_dpto,
                domicilio_referencia: data.domicilio_referencia,
                codigo_postal: {
                    codigo_postal: data.codigo_postal,
                    localidad: data.localidad
                }
            },
            contacto: {
                telefono_fijo: data.telefono_fijo,
                telefono_movil: data.telefono_movil,
                red_social_contacto: data.red_social_contacto,
                red_social_nombre: data.red_social_nombre,
                email_contacto: data.email_contacto,
                observacion_contacto: data.observacion_contacto
            },
            persona_extendida: {
                estado_civil: data.estado_civil,
                ocupacion: data.ocupacion,
                estudios_alcanzados: data.estudios_alcanzados,
                vencimiento_dni: data.vencimiento_dni,
                foto_perfil: data.foto_perfil
            }
        };

        // Establecer los datos del nuevo usuario
        setNewUser(structuredData);
    }

    const handleSubmit = async () => {
        
    };

    useEffect(() => {
        if (currentStep === 4) {
            //Valido el resumen
            handleCheckResumen();
        }
    }, [currentStep]);

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
