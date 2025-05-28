import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Fade } from 'react-awesome-reveal'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs"

import FormDatos from "@/components/profile/FormDatos"
import FormServicios from "@/components/profile/FormServicios"
import FormContacto from "@/components/profile/FormContacto"
import FormDomicillio from "@/components/profile/FormDomicillio"

function ProfileForm() {
  const navigate = useNavigate()

  const fixedData = {
    dni: '12345678',
    nombre: 'Franco',
    apellido: 'Pérez',
    email: 'franco.perez@email.com'
  }

  const [editableData, setEditableData] = useState({
    telefono: '',
    direccion: '',
    fecha_nacimiento_persona: "1994-07-04"
  })

  const [photoUrl, setPhotoUrl] = useState('https://i.pravatar.cc/150?img=69')
  const subscribedServices = ['Residencia', 'Becas', 'Oferta educativa']

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditableData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoUrl(url)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(
      `Datos guardados:\nTeléfono: ${editableData.telefono}\nDirección: ${editableData.direccion}`
    )
  }

  return (
    <Fade duration={300} triggerOnce>
      <div className="w-full flex items-center justify-center sm:p-4">
        <div className="w-full h-full sm:h-auto sm:max-w-md md:max-w-2xl shadow-md rounded-xl overflow-hidden">

          {/* Card principal con tabs */}
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
              {/* Foto de perfil */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img
                    className="w-24 h-24 object-cover rounded-full border-4 border-indigo-600 shadow-md"
                    src={photoUrl}
                    alt="Foto de perfil"
                  />
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 cursor-pointer hover:bg-indigo-700 transition">
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 4a3 3 0 110 6 3 3 0 010-6z" />
                    </svg>
                  </label>
                </div>
              </div>

              <Tabs defaultValue="datos" className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-3">
                  <TabsTrigger value="datos">Datos Personales</TabsTrigger>
                  <TabsTrigger value="contacto">Contacto</TabsTrigger>
                  <TabsTrigger value="domicillio">Domicillio</TabsTrigger>
                  <TabsTrigger value="servicios">Mis Servicios</TabsTrigger>
                </TabsList>

                <TabsContent value="datos">
                  <FormDatos handleSubmit={handleSubmit} fixedData={fixedData} editableData={editableData} />
                </TabsContent>

                <TabsContent value="contacto">
                 <FormContacto  handleSubmit={handleSubmit} fixedData={fixedData} editableData={editableData}  />
                </TabsContent>

                <TabsContent value="domicillio">
                 <FormDomicillio  handleSubmit={handleSubmit} fixedData={fixedData} editableData={editableData}  />
                </TabsContent>

                <TabsContent value="servicios">
                  <FormServicios subscribedServices={subscribedServices} />
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-between text-sm text-gray-500 border-t">
              <span>Última actualización: Hoy</span>
              <span>Perfil verificado</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Fade>
  )
}

export default ProfileForm