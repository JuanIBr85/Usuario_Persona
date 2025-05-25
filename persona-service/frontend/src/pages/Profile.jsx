import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Fade } from 'react-awesome-reveal'

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs"

function ProfileForm() {
  const navigate = useNavigate()

  const fixedData = {
    dni: '12345678',
    nombre: 'Franco',
    apellido: 'Pérez',
  }

  const [editableData, setEditableData] = useState({
    telefono: '',
    direccion: '',
    email: '',
  })

  const [photoUrl, setPhotoUrl] = useState('https://i.pravatar.cc/150?img=69')
  // const [activeTab, setActiveTab] = useState('datos')
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
      `Datos guardados:\nTeléfono: ${editableData.telefono}\nDirección: ${editableData.direccion}\nEmail: ${editableData.email}`
    )
  }

  return (
    <div className="max-w-lg mx-auto my-5 bg-white shadow-lg rounded-2xl p-8 mt-10">
      <Fade duration={500} triggerOnce>
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Mi Perfil</h1>

        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md"
              src={photoUrl}
              alt="Foto de perfil"
            />
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 cursor-pointer hover:bg-indigo-700 transition">
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 4a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </label>
          </div>

          <Tabs defaultValue="datos" className="w-full mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="datos">Datos</TabsTrigger>
              <TabsTrigger value="servicios">Servicios</TabsTrigger>
            </TabsList>

            <TabsContent value="datos">
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>DNI</Label>
                    <Input value={fixedData.dni} readOnly className="bg-gray-100 cursor-not-allowed" />
                  </div>
                  <div>
                    <Label>Nombre</Label>
                    <Input value={fixedData.nombre} readOnly className="bg-gray-100 cursor-not-allowed" />
                  </div>
                  <div className="col-span-2">
                    <Label>Apellido</Label>
                    <Input value={fixedData.apellido} readOnly className="bg-gray-100 cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={editableData.telefono}
                    onChange={handleChange}
                    placeholder="Ingresa tu teléfono"
                  />
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={editableData.direccion}
                    onChange={handleChange}
                    placeholder="Ingresa tu dirección"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editableData.email}
                    onChange={handleChange}
                    placeholder="Ingresa tu email"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Guardar Cambios
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate('/Login')}
                >
                  Volver
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="servicios">
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Servicios Suscritos</h2>
                <ul className="space-y-2">
                  {subscribedServices.map((service) => (
                    <li
                      key={service}
                      className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2"
                    >
                      <span className="text-gray-700">{service}</span>
                      <Button variant="link" className="text-indigo-600 hover:text-indigo-800 p-0 h-auto">
                        Ver detalles
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Fade>
    </div>
  )
}

export default ProfileForm
