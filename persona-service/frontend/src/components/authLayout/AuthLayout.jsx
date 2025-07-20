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
      <div className={cn("h-screen flex items-center justify-center", className)}>
        <div className="flex w-full h-full sm:h-[600px] sm:max-w-md md:max-w-3xl shadow-2xl border-1 border-gray-100 dark:border-gray-700 rounded-xl sm:overflow-hidden">
          {/* Sección visual (se oculta en móviles) */}
          {visualContent && (
            <Card className="w-full md:max-w-md h-full bg-[var(--color-primario)] hidden md:block rounded-none border-none">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-white select-none">
                  <div className="flex gap-2 justify-center items-center align-center scale-50">
                    <p>PRISMA</p>
                    <svg className="w-1/12 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.485,16.857l10,6c.027.016.057.023.084.036s.057.026.087.038a.892.892,0,0,0,.688,0c.03-.012.058-.024.087-.038s.057-.02.084-.036l10-6a1,1,0,0,0,.3-1.438l-10-14c-.013-.018-.035-.024-.049-.04a.962.962,0,0,0-1.53,0c-.014.016-.036.022-.049.04l-10,14a1,1,0,0,0,.3,1.438ZM13,20.234V5.121L20.557,15.7ZM11,5.121V20.234L3.443,15.7Z"/></svg>
                  </div>
                  {title}
                </CardTitle>
                {description && (
                  <p className="text-center text-white/80">{description}</p>
                )}
              </CardHeader>
              <CardContent className="flex mt-[120px] justify-center h-full">
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
              <CardTitle className="text-2xl select-none">
                  <div className="flex gap-2 justify-center items-center align-center scale-50">
                    <p>PRISMA</p>
                    <svg className="w-1/12 fill-black dark:fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.485,16.857l10,6c.027.016.057.023.084.036s.057.026.087.038a.892.892,0,0,0,.688,0c.03-.012.058-.024.087-.038s.057-.02.084-.036l10-6a1,1,0,0,0,.3-1.438l-10-14c-.013-.018-.035-.024-.049-.04a.962.962,0,0,0-1.53,0c-.014.016-.036.022-.049.04l-10,14a1,1,0,0,0,.3,1.438ZM13,20.234V5.121L20.557,15.7ZM11,5.121V20.234L3.443,15.7Z"/></svg>
                  </div>
                {title}
              </CardTitle>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </CardHeader>
            <CardContent className="h-full">
              {children}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 items-center">
              <div className="flex items-center gap-2">
                <Button variant="link" asChild><Link to="/faq/termsofservice">Términos de uso</Link></Button>
                <Button variant="link" asChild><Link to="/faq/privacypolicy">Política de privacidad</Link></Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Fade>
  );
};

export default AuthLayout;
