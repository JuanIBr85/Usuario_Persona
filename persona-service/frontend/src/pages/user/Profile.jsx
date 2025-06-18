import React from 'react';
import { Fade } from 'react-awesome-reveal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Componentes
import FormDatos from "@/components/profile/FormDatos"
import FormServicios from "@/components/profile/FormServicios"
import FormContacto from "@/components/profile/FormContacto"
import FormDomicillio from "@/components/profile/FormDomicillio"
import ProfilePhoto from "@/components/profile/ProfilePhoto"
import FormPersonaExtendida from "@/components/profile/FormPersonaExtendida"
import Loading from '@/components/loading/Loading'
import {SimpleDialog} from '@/components/SimpleDialog'
// Hooks y utilidades
import { useProfile } from "@/hooks/profile/useProfile"
import { tiempoTranscurrido } from "@/utils/dateUtils"

/**
 * Componente principal del perfil de usuario
 * Maneja la visualización y edición de la información del perfil
 */
const ProfileForm = () => {
  const {
    isLoading,
    personaData,
    photoUrl,
    email,
    staticData,
    handlePhotoChange,
    setPersonaData,
    dialog ,
    setDialog,
  } = useProfile();

  const lastUpdate = tiempoTranscurrido(personaData.updated_at);
  const subscribedServices = ['Residencia', 'Becas', 'Oferta educativa'];
  
  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <SimpleDialog 
        title={dialog?.title} 
        description={dialog?.description} 
        isOpen={dialog}
        actionHandle={()=>{
          setDialog(null);
          setTimeout(() => dialog?.action(), 500);
        }}
      />
      <Fade duration={300} triggerOnce>
        

        <div className="w-full flex items-center justify-center sm:p-4" >
          <div className="w-full h-full sm:h-auto md:max-w-7xl shadow-md rounded-xl overflow-hidden w-full flex items-center justify-center sm:p-4">
            <Card className="w-full h-full rounded-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Gestiona tus datos y servicios suscritos
                </CardDescription>
              </CardHeader>

              <CardContent className="h-full overflow-y-auto">
                <ProfilePhoto
                  photoUrl={`https://ui-avatars.com/api/?name=${personaData.nombre_persona}+${personaData.apellido_persona}&background=random`}
                  onPhotoChange={handlePhotoChange}
                />

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
        </div>
      </Fade>
    </>
  );
};

export default ProfileForm;