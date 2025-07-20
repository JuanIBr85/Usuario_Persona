
import { Fade } from "react-awesome-reveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading/Loading";
import { SimpleDialog } from "@/components/SimpleDialog";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { PersonaService } from "@/services/personaService";
import { formSubmitJson } from "@/utils/formUtils";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/createProfile/ProgressBar";
import { Documento } from "@/components/connectProfile/steps/Documento";
import { VerificarEmail } from "@/components/connectProfile/steps/VerificarEmail";
import { VerificarOTP } from "@/components/connectProfile/steps/VerificarOTP";
import { VerificarIdentidad } from "@/components/connectProfile/steps/VerificarIdentidad";
import { useAuthContext } from "@/context/AuthContext";
import useFetchMessage from "@/utils/useFetchMessage";

/**
 * PerfilConnect.jsx
 * 
 * Vista responsable del proceso de vinculación de un perfil existente en el sistema
 * con una cuenta de usuario autenticada.
 * 
 * Flujo general:
 * 1. El usuario ingresa su documento para buscar su perfil.
 * 2. Verifica su correo electrónico.
 * 3. Ingresa el código OTP enviado por email.
 * 4. En caso de email incorrecto o no coincidencia, se solicita verificación manual de identidad.
 * 
 * Este proceso sirve para asegurar que el usuario actual tiene acceso legítimo a un perfil en el sistema.
 */

const steps = [
  'Documento',
  'Email',
  'Código',
  'Identidad',
];

function PerfilConnect() {
  // Estado actual del paso del flujo (0 a 3)
  const [currentStep, setCurrentStep] = useState(0);
  // Estado para mostrar spinner de carga
  const [loading, setLoading] = useState(false);
  // Estado para mostrar diálogos de confirmación o error
  const [dialog, setDialog] = useState(null);
  // Email recuperado tras verificar documento
  const [email, setEmail] = useState(null);
  // Tipos de documentos disponibles
  const [tipoDocumento, setTipoDocumento] = useState({});
  // Datos temporales del proceso (documento, email, etc.)
  const [tempData, setTempData] = useState({});

  // Referencia al formulario en cada paso
  const formRef = useRef(null);
  const navigate = useNavigate();
  const { authData } = useAuthContext();

  // Si el usuario ya tiene un perfil vinculado, redirigir a /profile
  useEffect(()=>{
    if(authData?.user?.id_persona && authData?.user?.id_persona !== 0){
      navigate('/profile');
    }
  }, [authData])

  // Obtener los tipos de documentos válidos desde el backend
  useEffect(() => {
    PersonaService.get_tipos_documentos()
      .then(response => {
        setTipoDocumento(response.data)
      })
      .catch(error => {
        setDialog({
          title: "Hubo un error",
          actionName: "Cerrar",
          description: "Hubo un error al obtener los tipos de documentos",
          action: () => window.location.reload(),
        });
      });
  }, [])

  /**
   * Paso 1: Verifica el documento ingresado y recupera el email asociado.
   * Si no existe, ofrece opción de crear perfil nuevo.
   */
  const handleDNIVerificacion = async (event) => {
    event.preventDefault();
    const formData = await formSubmitJson(event);
    setLoading(true);

    try {
      const response = await PersonaService.verificar_documento(formData);
      setEmail(response.data.email);
      setTempData(formData);
      nextStep();
    } catch (error) {
      console.error(error);
      if(error.statusCode === 430){
        setDialog({
          title: "Documento registrado",
          actionName: "Continuar",
          cancelAction: () => setDialog(null),
          description: <>
            El documento esta registrado, pero no esta vinculado a un usuario
            <br/>
            Pongase en contacto en el administrador para resolver este problema
            <br/>
            Porfavor rellene el siguiente formulario para que el administrador pueda resolver este problema
            <br/>
            Si este no es su documento <b>{formData.num_doc_persona}</b>, por favor ingrese el documento correcto
          </>,
          action: () => setCurrentStep(3),
        });
      }else if (error.statusCode === 404) {
        setDialog({
          title: "Crear perfil",
          action: () => navigate("/createperfil",{state: formData}),
          cancelAction: () => setDialog(null),
          description: <>
            No se encontró el documento, vamos a crear un nuevo perfil

            Estos datos son correctos antes de continuar?
            <br/><br/>
            <b>Tipo: </b>{formData.tipo_documento}<br/>
            <b>Documento: </b>{formData.num_doc_persona}
          </>
        })
      }else{
        setDialog({
          title: "Hubo un error",
          actionName: "Cerrar",
          description: useFetchMessage(error?.data?.error?.server || error?.data?.error, "Documento invalido"),
          action: () =>setDialog(null)
        });
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Paso 2: Verificación del email recuperado.
   * El backend envía un código OTP al correo.
   */
  const handleEmailVerification = async (event) => {
    event.preventDefault();
    const formData = await formSubmitJson(event);
    setLoading(true);

    try {
      const response = await PersonaService.verificar_email({
        ...tempData,
        ...formData
      });
      setTempData({ ...response.data });

      setDialog({
        title: "Verificación exitosa",
        actionName: "Continuar",
        description: "Se envio un codigo de verificación a su correo electrónico",
        action: () => nextStep(),
      });
    } catch (error) {
      setDialog({
        title: "Hubo un error",
        actionName: "Cerrar",
        description: error?.data?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Paso 3: Validación del código OTP enviado al email.
   * Si es correcto, se vincula el perfil.
   */
  const handleOTPVerification = async (event) => {
    event.preventDefault();
    const formData = await formSubmitJson(event);
    setLoading(true);

    try {
      await PersonaService.verificar_otp({
        ...tempData,
        ...formData
      });

      setDialog({
        title: "Vinculacion exitosa",
        actionName: "Continuar",
        description: "Se vinculo exitosamente su perfil",
        action: () => navigate('/searchprofile'),
      });
    } catch (error) {
      setDialog({
        title: "Hubo un error",
        actionName: "Cerrar",
        description: error?.data?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Paso 4: Verificación manual de identidad si no fue posible validar email u OTP.
   * Se envía una solicitud al administrador.
   */
  const handleIdentidadVerification = async (event) => {
    event.preventDefault();
    const formData = await formSubmitJson(event);
    setLoading(true);

    try {
      const response = await PersonaService.verificar_identidad({
        ...formData,
        ...tempData,
        usuario_email:authData.user.email_usuario
      });

      setDialog({
        title: "Verificar identidad",
        action: () => {
          //Marcamos este cliente como esperando al admin para su vinculacion.
          const expirationTime = new Date();
          expirationTime.setMinutes(expirationTime.getMinutes() + 1);
          //expirationTime.setHours(expirationTime.getHours() + 6);
          localStorage.setItem("persona-esperando-admin", expirationTime.toISOString());
          navigate('/searchprofile')
        },
        description: <>
            Tus petición fue aceptada, enviaremos una petición de verificación al administrador, te contactaremos pronto
            <br />
            En caso de no ser contactado, puedes contactarnos al correo <a className="text-blue-500" href="mailto:soporte@persona.com">soporte@persona.com</a>
            <br />
            o llamar al número <a className="text-blue-500" href="tel:+56912345678">+56912345678</a>
          </>
      })
    } catch (error) {
      setDialog({
        title: <span className="text-destructive">Hubo un error</span>,
        actionName: "Cerrar",
        description: <>
          Hubo un error al verificar su identidad
          <br />
          <b>Razon</b>: {error?.data?.message}
        </>,
      });
    } finally {
      setLoading(false);
    }
  }


  // Avanza al siguiente paso del flujo (máximo hasta el 3)
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  
  // Si el usuario indica que su email es incorrecto, pasa a validación manual
  const handleEmailIncorrecto = () => {
    setCurrentStep(3); // Ir directamente al paso de verificación de identidad
  };

  /**
   * Renderiza dinámicamente el componente correspondiente al paso actual.
   */
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Documento
            formRef={formRef}
            tipoDocumento={tipoDocumento}
            onSubmit={handleDNIVerificacion}
            loading={loading}
          />
        );
      case 1:
        return (
          <VerificarEmail
            formRef={formRef}
            email={email}
            onSubmit={handleEmailVerification}
            onEmailIncorrecto={handleEmailIncorrecto}
            loading={loading}
          />
        );
      case 2:
        return (
          <VerificarOTP
            formRef={formRef}
            onSubmit={handleOTPVerification}
            loading={loading}
          />
        );
      case 3:
        return (
          <VerificarIdentidad
            formRef={formRef}
            setDialog={setDialog}
            onSubmit={handleIdentidadVerification}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Modal de errores o acciones */}
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

      {/* Spinner de carga */}
      {loading && <Loading isFixed={true} />}

      {/* Contenido principal con animación */}
      <Fade duration={300} triggerOnce>
        <div className="w-full flex items-center justify-center sm:p-4">
          <Card className="w-full max-w-2xl shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Vinculación de perfil
              </CardTitle>              
              <CardDescription>
                <p>Conecta tu perfil con tu cuenta de usuario</p>
                <p>Verificaremos si estás en el sistema</p>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 min-h-70">
              <div className="space-y-8 flex-1">
                {/* Barra de progreso del flujo */}
                <ProgressBar currentStep={currentStep} steps={steps} size={10}/>
                <div className="mb-6">
                  {renderStep()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Fade>
    </>
  );
}

export default PerfilConnect;