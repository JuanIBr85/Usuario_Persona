import React from 'react'
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'
import { Fade } from "react-awesome-reveal";

/**
 * Componente de error 404.
 * Muestra un mensaje de "Página no encontrada" y un botón para volver a la página de inicio.
 *
 * @returns {JSX.Element} Página de error 404.
 */

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50 dark:bg-background">
      <Fade duration={300} triggerOnce>
        <h1 className="text-9xl font-extrabold text-gray-300">404</h1>
        <p className="mb-8 text-xl text-gray-600">Página no encontrada</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </Fade>
    </div>
  )
}

export default NotFound
