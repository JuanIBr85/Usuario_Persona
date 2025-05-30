import React from 'react'
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-background">
      <h1 className="text-9xl font-extrabold text-gray-300">404</h1>
      <p className="mb-8 text-xl text-gray-600">Página no encontrada</p>
      <Button variant="outline" onClick={() => navigate('/')}>
        Volver al inicio
      </Button>
    </div>
  )
}

export default NotFound
