
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

const steps = [
  'Documento',
  'Email',
  'Código',
  'Identidad',
];

function PerfilConnect() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [email, setEmail] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState({});
  const [tempData, setTempData] = useState({});
  const formRef = useRef(null);
  const navigate = useNavigate();
  const { authData } = useAuthContext();

  useEffect(()=>{
    if(authData?.user?.id_persona && authData?.user?.id_persona !== 0){
      //navigate('/profile');
    }
  }, [authData])

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
      if (error.statusCode === 404) {
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
      }
    } finally {
      setLoading(false);
    }
  }

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
      nextStep();
    } catch (error) {
      console.error(error);
      alert(error.data.message)
    } finally {
      setLoading(false);
    }
  }

  const handleOTPVerification = async (event) => {
    event.preventDefault();
    const formData = await formSubmitJson(event);
    setLoading(true);

    try {
      await PersonaService.verificar_otp({
        ...tempData,
        ...formData
      });
      navigate('/searchprofile');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };


  const handleEmailIncorrecto = () => {
    setCurrentStep(3); // Ir directamente al paso de verificación de identidad
  };

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
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <SimpleDialog
        title={dialog?.title}
        description={dialog?.description}
        actionHandle={dialog?.action}
        cancelHandle={dialog?.cancelAction}
        cancel={dialog?.cancelAction && "Cancelar"}
        isOpen={dialog}
        setIsOpen={() => setDialog(null)}
        className="sm:max-w-3xl"
      />
      {loading && <Loading isFixed={true} />}
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
