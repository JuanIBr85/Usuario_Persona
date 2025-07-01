import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/loading/Loading';
import { formJson } from '@/utils/formUtils';
import { useNavigate } from 'react-router-dom';
// Importar componentes
import { ProgressBar } from '@/components/createProfile/ProgressBar';
import DatosPersonales from '@/components/createProfile/steps/DatosPersonales';
import Contacto from '@/components/createProfile/steps/Contacto';
import Domicilio from '@/components/createProfile/steps/Domicilio';
import InfoAdicional from '@/components/createProfile/steps/InfoAdicional';
import Resumen from '@/components/createProfile/steps/Resumen';

import { PersonaService } from '@/services/personaService';

function CreatePerfil() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const refForm = useRef(null);
  const [newUser, setNewUser] = useState({});
  const navigate = useNavigate();

  const [staticData, setStaticData] = useState({
    estados_civiles: [],
    ocupaciones: [],
    estudios_alcanzados: [],
    tipos_documento: [],
    redes_sociales: []
  });

  const getFormValues = async (elements = {}) => {
    refForm.current.checkValidity();
    const formData = {
      ...(await formJson(refForm.current)),
      ...elements
    };

    Object.keys(formData).forEach(key => {
      if (formData[key] === "") {
        formData[key] = undefined;
      }
    });

    return {
      nombre_persona: formData.nombre_persona,
      apellido_persona: formData.apellido_persona,
      fecha_nacimiento_persona: formData.fecha_nacimiento_persona,
      tipo_documento: formData.tipo_documento,
      num_doc_persona: formData.num_doc_persona,
      domicilio: {
        domicilio_calle: formData.domicilio_calle,
        domicilio_numero: formData.domicilio_numero,
        domicilio_piso: formData.domicilio_piso,
        domicilio_dpto: formData.domicilio_dpto,
        domicilio_referencia: formData.domicilio_referencia,
        codigo_postal: {
          codigo_postal: formData.codigo_postal,
          localidad: formData.localidad
        }
      },
      contacto: {
        telefono_fijo: formData.telefono_fijo,
        telefono_movil: formData.telefono_movil,
        red_social_contacto: formData.red_social_contacto,
        red_social_nombre: formData.red_social_nombre,
        email_contacto: formData.email_contacto,
        observacion_contacto: formData.observacion_contacto
      },
      persona_extendida: {
        estado_civil: formData.estado_civil,
        ocupacion: formData.ocupacion,
        estudios_alcanzados: formData.estudios_alcanzados,
        vencimiento_dni: formData.vencimiento_dni,
        foto_perfil: formData.foto_perfil
      }
    }
  }

  const handleCheckResumen = async () => {

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

    const structuredData = await getFormValues(elements);

    // Establecer los datos del nuevo usuario
    setNewUser(structuredData);
  }

  const handleSubmit = async () => {
    if (!refForm.current.checkValidity()) {
      alert("Por favor, completa todos los campos correctamente.")
      return;
    }

    const data = await getFormValues();

    PersonaService
      .crear_perfil(data)
      .then(response => {
        alert("Perfil creado exitosamente");
        setTimeout(() => navigate("/profile"), 2000);
      })
      .catch(error => {
        console.log(error)
        alert("Error al crear el perfil");
      });
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


  const fetchData = async () => {
    try {
      const [tiposDocumentoResponse, redes_socialesResponse, estados_civilesResponse, ocupacionesResponse, estudios_alcanzadosResponse] = await Promise.all([
        PersonaService.get_tipos_documentos(),
        PersonaService.get_redes_sociales(),
        PersonaService.get_estados_civiles(),
        PersonaService.get_ocupaciones(),
        PersonaService.get_estudios_alcanzados()
      ]);

      setStaticData({
        estados_civiles: estados_civilesResponse?.data || [],
        ocupaciones: ocupacionesResponse?.data || [],
        estudios_alcanzados: estudios_alcanzadosResponse?.data || [],
        tipos_documento: tiposDocumentoResponse?.data || [],
        redes_sociales: redes_socialesResponse?.data || []
      });
    } catch (error) {
      console.log(error);
      alert("Error al cargar datos");
      navigate("/*");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { setIsLoading(true); fetchData() }, []);


  if (isLoading) {
    return <Loading text="Cargando datos..." />;
  }

  const renderStep = () => {
    return <>
      <DatosPersonales hidden={currentStep !== 0} staticData={staticData} />
      <Contacto hidden={currentStep !== 1} staticData={staticData} />
      <Domicilio hidden={currentStep !== 2} staticData={staticData} />
      <InfoAdicional hidden={currentStep !== 3} staticData={staticData} />
      <Resumen hidden={currentStep !== 4} newUser={newUser} />
    </>
  };


  return (
    <>
      <div className="container sm:mx-auto py-8">
        <Card className="sm:max-w-4xl mx-auto">
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
