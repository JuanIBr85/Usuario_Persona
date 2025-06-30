import React, { useState } from 'react';
import { Fade } from 'react-awesome-reveal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Componentes
import FormDatos from "@/components/profile/FormDatos"
import FormServicios from "@/components/profile/FormServicios"
import FormContacto from "@/components/profile/FormContacto"
import FormDomicillio from "@/components/profile/FormDomicillio"
import FormPersonaExtendida from "@/components/profile/FormPersonaExtendida"
import Loading from '@/components/loading/Loading'
import { SimpleDialog } from '@/components/SimpleDialog'
// Hooks y utilidades
import { useProfile } from "@/hooks/profile/useProfile"
import { tiempoTranscurrido } from "@/utils/dateUtils"
import ProfileNick from '@/components/ProfileNick'


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

  const lastUpdate = tiempoTranscurrido(personaData.updated_at);
  const subscribedServices = ['Residencia', 'Becas', 'Oferta educativa'];
  return (
    <>
      <SimpleDialog
        title={dialog?.title}
        description={dialog?.description}
        isOpen={dialog}
        actionHandle={() => {
          setTimeout(() => {
            setDialog(null);
            dialog?.action();
          }, 500);
        }}
      />
      <Fade duration={300} triggerOnce>


        <div className="w-full flex items-center justify-center sm:p-4">
          <Card className="w-full max-w-7xl shadow-lg rounded-xl overflow-hidden">
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
                    <TabsTrigger value="personaExtendida">Datos Extendidos</TabsTrigger>
                    <TabsTrigger value="servicios">Mis Servicios</TabsTrigger>
                  </TabsList>

                  <TabsContent value="datos">
                    <FormDatos
                      tipoDocumento={staticData.tipos_documento}
                      personaData={{ ...personaData, email }}
                      persona_id={personaData.id_persona}
                      setPersonaData={setPersonaData}
                    />
                  </TabsContent>

                  <TabsContent value="contacto">
                    <FormContacto
                      persona_id={personaData.id_persona}
                      contacto={personaData.contacto || {}}
                      redes_sociales={staticData.redes_sociales}
                      setPersonaData={setPersonaData}
                    />
                  </TabsContent>

                  <TabsContent value="domicilio">
                    <FormDomicillio
                      domicilio={personaData.domicilio || {}}
                      persona_id={personaData.id_persona}
                      setPersonaData={setPersonaData}
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
                    />
                  </TabsContent>

                  <TabsContent value="servicios">
                    <FormServicios
                      servicios={subscribedServices}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="flex justify-between text-sm text-gray-500 border-t">
                <span>Última actualización: hace {lastUpdate}</span>
              </CardFooter>
            </Card>
        </div>
      </Fade>
    </>
  );
};

export default ProfileForm;