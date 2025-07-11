import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/loading/Loading';
import { formJson } from '@/utils/formUtils';
import { useNavigate, useLocation } from 'react-router-dom';

// Importar componentes
import { ProgressBar } from '@/components/createProfile/ProgressBar';
import DatosPersonales from '@/components/createProfile/steps/DatosPersonales';
import Contacto from '@/components/createProfile/steps/Contacto';
import Domicilio from '@/components/createProfile/steps/Domicilio';
import InfoAdicional from '@/components/createProfile/steps/InfoAdicional';
import Resumen from '@/components/createProfile/steps/Resumen';

import { useAuthContext } from "@/context/AuthContext";
import { SimpleDialog } from '@/components/SimpleDialog';
import { PersonaService } from '@/services/personaService';

/**
 * CreatePerfil.jsx
 *
 * Vista para la creación de un nuevo perfil cuando no se encuentra
 * uno existente durante el proceso de vinculación. Permite al usuario completar
 * un formulario dividido por pasos para ingresar su información personal.
 *
 * Flujo general:
 * - El usuario accede desde `PerfilConnect` si no se encuentra un perfil vinculado.
 * - Se cargan los datos estáticos necesarios (tipos de documento, redes sociales, etc).
 * - El formulario se presenta en pasos secuenciales (Datos, Contacto, Domicilio, Info Adicional, Resumen).
 * - Se utiliza un formulario controlado por referencias (`refForm`) y validación manual.
 * - En el paso final se muestra un resumen, y se puede enviar todo el perfil al backend.
 * - Se usa `SimpleDialog` para mostrar errores o confirmaciones.
 */

// Nombres de cada paso
const steps = ['Datos Personales', 'Contacto', 'Domicilio', 'Información Adicional', 'Resumen'];

function CreatePerfil() {
  // Paso actual del formulario
  const [currentStep, setCurrentStep] = useState(0);

  // Spinner de carga general
  const [isLoading, setIsLoading] = useState(false);

  // Referencia al formulario
  const refForm = useRef(null);

  // Estado que acumula los datos del nuevo usuario a medida que avanza
  const [newUser, setNewUser] = useState({});
  const navigate = useNavigate();
  const { authData } = useAuthContext();
  const location = useLocation();

  // Modal de diálogo para errores y confirmaciones
  const [dialog, setDialog] = useState(null);


  // Redirecciona al perfil si el usuario ya tiene uno
  useEffect(() => {
    if (authData?.user?.id_persona && authData?.user?.id_persona !== 0) {
      navigate('/profile');
    }
  }, [authData])

  // Si no hay datos de documento pasados desde `/profileconnect`, se redirige
  useEffect(() => {
    if (!location?.state || !location?.state?.tipo_documento || !location?.state?.num_doc_persona) {
      navigate('/profileconnect');
    }
  }, [location]);

  // Datos estáticos necesarios para los formularios
  const [staticData, setStaticData] = useState({
    estados_civiles: [],
    ocupaciones: [],
    estudios_alcanzados: [],
    tipos_documento: [],
    redes_sociales: []
  });

  /**
   * Convierte el formulario actual en JSON y construye la estructura
   * completa del perfil esperada por el backend.
   */
  const getFormValues = async (elements = {}) => {
    refForm.current.checkValidity();

    const formData = {
      ...(await formJson(refForm.current)),
      ...elements
    };

    // Elimina campos vacíos del resultado
    Object.keys(formData).forEach(key => {
      if (formData[key] === "") {
        formData[key] = undefined;
      }
    });

    return {
      nombre_persona: formData.nombre_persona,
      apellido_persona: formData.apellido_persona,
      fecha_nacimiento_persona: formData.fecha_nacimiento_persona,
      tipo_documento: location.state.tipo_documento,
      num_doc_persona: location.state.num_doc_persona,
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

  /**
   * Valida el formulario y arma el resumen del nuevo usuario (Paso 5)
   */
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

  /**
   * Envío del formulario completo al backend
   */
  const handleSubmit = async () => {
    if (!refForm.current.checkValidity()) {
      setDialog({
        title: "Error",
        actionName: "Cerrar",
        description: "Por favor, completa todos los campos correctamente.",
      });
      return;
    }

    const data = await getFormValues();

    PersonaService
      .crear_perfil(data)
      .then(response => {
        setDialog({
          title:"Exito",
          description: "Perfil creado exitosamente",
          action:()=>navigate("/searchprofile")
        })
      })
      .catch(error => {
        console.log(error)
        setDialog({
          title: "Error",
          actionName: "Cerrar",
          description: "Error al crear el perfil",
        })
      });
  };

  useEffect(() => {
    if (currentStep === 4) {
      //Valido el resumen
      handleCheckResumen();
    }
  }, [currentStep]);

  /**
   * Avanzar y retroceder en el formulario paso a paso
   */
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  /**
   * Carga inicial de datos estáticos para todos los pasos del formulario
   */
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
        tipos_documento: tiposDocumentoResponse?.data || {},
        redes_sociales: redes_socialesResponse?.data || []
      });
    } catch (error) {
      console.log(error);
      setDialog({
        title: "Error",
        actionName: "Cerrar",
        description: "Error al cargar datos",
        action:()=>window.location.reload()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { setIsLoading(true); fetchData() }, []);


  if (isLoading) {
    return <Loading text="Cargando datos..." />;
  }

  /**
   * Renderiza el paso correspondiente del formulario
   */
  const renderStep = () => {
    return <>
      <DatosPersonales hidden={currentStep !== 0} staticData={staticData} documento={location.state ?? {}}/>
      <Contacto hidden={currentStep !== 1} staticData={staticData} />
      <Domicilio hidden={currentStep !== 2} staticData={staticData} />
      <InfoAdicional hidden={currentStep !== 3} staticData={staticData} />
      <Resumen hidden={currentStep !== 4} newUser={newUser} />
    </>
  };


  return (
    <>
      {/* Modal de diálogo para mensajes */}
      <SimpleDialog
        title={dialog?.title}
        description={dialog?.description}
        actionHandle={dialog?.action}
        cancelHandle={dialog?.cancelAction}
        cancel={dialog?.cancelAction && "Cancelar"}
        action={dialog?.actionName}
        isOpen={dialog}
        setIsOpen={() => setDialog(null)}
        className="sm:max-w-3xl"
      />

      {/* Contenedor principal */}
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
                <ProgressBar currentStep={currentStep} setCurrentStep={setCurrentStep} steps={steps}/>
                <div className="mb-6">
                  {renderStep()}
                </div>
              </div>
            </form>
          </CardContent>

          {/* Navegación entre pasos */}
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