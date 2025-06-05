import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Fade } from "react-awesome-reveal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

/**
 * Componente de diseño para páginas de autenticación
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido principal del formulario
 * @param {string} props.title - Título de la página
 * @param {string} [props.description] - Descripción opcional
 * @param {React.ReactNode} [props.visualContent] - Contenido visual para el lado izquierdo (opcional)
 * @param {string} [props.className] - Clases CSS adicionales para personalizar el contenedor
 */
const AuthLayout = ({
  children,
  title,
  description,
  visualContent = null,
  className = ''
}) => {
  return (
    <Fade duration={500} triggerOnce>
      {/* COLOR DE FONDO TEMPORAL, SOLO PARA DIFERENCIAR DEL FONDO */}
      <div className={cn("h-screen flex items-center bg-blue-500 justify-center", className)}>
        <div className="flex w-full h-full sm:h-[520px] sm:max-w-md md:max-w-3xl shadow-md rounded-xl overflow-hidden">
          {/* Sección visual (se oculta en móviles) */}
          {visualContent && (
            <Card className="w-full md:max-w-md h-full bg-[var(--color-primario)] hidden md:block rounded-none border-none">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-white">
                  {title}
                </CardTitle>
                {description && (
                  <p className="text-center text-white/80">{description}</p>
                )}
              </CardHeader>
              <CardContent className="flex items-center justify-center h-full">
                {visualContent}
              </CardContent>
              <CardFooter className="flex justify-center">
                {/* Espacio para contenido adicional en el pie de la sección visual */}
              </CardFooter>
            </Card>
          )}

          {/* Contenido principal */}
          <Card className="w-full md:max-w-md h-full rounded-none border-none">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {title}
              </CardTitle>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </CardHeader>
            <CardContent className="h-full">
              {children}
            </CardContent>
            <CardFooter className="justify-center flex gap-2">
              <Button variant="link" asChild><Link to="termsofservice">Términos de uso</Link></Button>
              <Button variant="link" asChild><Link to="privacypolicy">Política de privacidad</Link></Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Fade>
  );
};

export default AuthLayout;
