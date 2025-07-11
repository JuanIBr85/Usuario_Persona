import React, { useEffect, useState } from 'react';
import { Fade } from 'react-awesome-reveal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Componentes
import FormDatos from "@/components/profile/FormDatos"
import FormUsuario from "@/components/profile/FormUsuario"
import FormContacto from "@/components/profile/FormContacto"
import FormDomicillio from "@/components/profile/FormDomicillio"
import FormPersonaExtendida from "@/components/profile/FormPersonaExtendida"
import Loading from '@/components/loading/Loading'
import { SimpleDialog } from '@/components/SimpleDialog'
// Hooks y utilidades
import { useProfile } from "@/hooks/profile/useProfile"
import { tiempoTranscurrido } from "@/utils/dateUtils"
import ProfileNick from '@/components/ProfileNick'

import { Ban, Check } from "lucide-react";

/**
 * Componente principal del perfil de usuario
 * Maneja la visualización y edición de la información del perfil
 */
const ProfileForm = () => {
  const {
    isLoading,
    personaData,
    email,
    staticData,
    setPersonaData,
    dialog,
    setDialog,
    isCriticalError
  } = useProfile();
  const [lastUpdate, setLastUpdate] = useState(undefined);
  const [dias, setDias] = useState(undefined);

  useEffect(() => {
    const updateDate = () => {
      const {lastUpdate, dias} = tiempoTranscurrido(personaData.updated_at);
      setLastUpdate(lastUpdate);
      setDias(dias);
    };
    const interval = setInterval(updateDate, 1000);
    updateDate();
    return () => clearInterval(interval);
  }, [personaData.updated_at]);

  const showDialog = (title, description, actionName=undefined, action=undefined) => {
    setDialog({
      title,
      description,
      action,
      actionName
    })
  };

  const okDialog = () => {
    showDialog(
      <div className="flex flex-row items-center gap-2"><Check /> Exito</div>,
      "Datos actualizados correctamente.",
      "Cerrar"
    );
  }

  const errorDialog = (description) => {
    const title=<div className="flex flex-row items-center gap-2"><Ban /> Ocurrió un error</div>;
    showDialog(title, description || "No se pudieron guardar los datos. Intenta nuevamente.", "Cerrar");
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isCriticalError) {
    return <SimpleDialog
      title={dialog?.title}
      description={dialog?.description}
      isOpen={dialog}
      actionHandle={() => {
        setTimeout(() => {
          console.log(dialog)
          dialog?.action();
          setDialog(null);
        }, 500);
      }}
    />
  }

  
  return (
    <>
      <SimpleDialog
        title={dialog?.title}
        description={dialog?.description}
        isOpen={dialog}
        action={dialog?.actionName}
        actionHandle={() => {
          setTimeout(() => {
            setDialog(null);
            dialog?.action && dialog?.action();
          }, 500);
        }}
      />
      <Fade duration={300} triggerOnce>


        <div className="w-full flex items-center justify-center sm:p-4">
          <Card className="w-full max-w-5xl shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Información Personal
              </CardTitle>
              <CardDescription>
                Gestiona tus datos y servicios suscritos
              </CardDescription>
            </CardHeader>

            <CardContent className="h-full overflow-y-auto">
              <ProfileNick firstName={personaData.nombre_persona} lastName={personaData.apellido_persona} />

              <Tabs defaultValue="datos" className="w-full">
                <TabsList className="flex flex-wrap gap-2 w-full mb-3 h-auto">
                  <TabsTrigger value="datos">Datos Personales</TabsTrigger>
                  <TabsTrigger value="contacto">Contacto</TabsTrigger>
                  <TabsTrigger value="domicilio">Domicilio</TabsTrigger>
                  <TabsTrigger value="personaExtendida">Datos Complementarios</TabsTrigger>
                  <TabsTrigger value="usuario">Mi Usuario</TabsTrigger>
                </TabsList>

                <TabsContent value="datos">
                  <FormDatos
                    tipoDocumento={staticData.tipos_documento}
                    personaData={{ ...personaData, email }}
                    persona_id={personaData.id_persona}
                    setPersonaData={setPersonaData}
                    showDialog={showDialog}
                    okDialog={okDialog}
                    errorDialog={errorDialog}
                    dias={dias}
                  />
                </TabsContent>

                <TabsContent value="contacto">
                  <FormContacto
                    persona_id={personaData.id_persona}
                    contacto={personaData.contacto || {}}
                    redes_sociales={staticData.redes_sociales}
                    setPersonaData={setPersonaData}
                    showDialog={showDialog}
                    okDialog={okDialog}
                    errorDialog={errorDialog}
                  />
                </TabsContent>

                <TabsContent value="domicilio">
                  <FormDomicillio
                    domicilio={personaData.domicilio || {}}
                    persona_id={personaData.id_persona}
                    setPersonaData={setPersonaData}
                    showDialog={showDialog}
                    okDialog={okDialog}
                    errorDialog={errorDialog}
                  />
                </TabsContent>

                <TabsContent value="personaExtendida">
                  <FormPersonaExtendida
                    persona_id={personaData.id_persona}
                    personaExtendida={personaData?.persona_extendida || {}}
                    estadosCiviles={staticData.estados_civiles}
                    ocupaciones={staticData.ocupaciones}
                    estudiosAlcanzados={staticData.estudios_alcanzados}
                    setPersonaData={setPersonaData}
                    showDialog={showDialog}
                    okDialog={okDialog}
                    errorDialog={errorDialog}
                  />
                </TabsContent>

                <TabsContent value="usuario">
                  <FormUsuario

                  />
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-between text-sm text-gray-500 border-t">
              {
                (lastUpdate!==undefined) && <span>Última actualización: {lastUpdate}</span>
              }
            </CardFooter>
          </Card>
        </div>
      </Fade>
    </>
  );
};

export default ProfileForm;