import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Main from "./Main";
import AccessibilityMenu from './AccesibilityMenu';

/**
 * Componente de diseño principal que envuelve el contenido de las páginas.
 * Controla la visibilidad del Header y Footer según la ruta actual.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar dentro del layout.
 * @returns {JSX.Element} Estructura de la página con Header, Footer, Main y menú de accesibilidad.
 */

const HiddenLayoutRoutes = ["/login", "/sign", "/forgotPassword"];

const Layout = ({ children }) => {
  const location = useLocation();

  // Oculta Header y Footer en rutas específicas (login, sign, forgotPassword)
  const hideHeaderFooter = HiddenLayoutRoutes.some(path => location.pathname.startsWith(path));

  return (
    <div className="flex flex-col h-screen">
      {!hideHeaderFooter && <Header />}
      <div className="flex flex-1">
        <Main>{children}</Main>
      </div>
      {!hideHeaderFooter && <Footer />}
      <AccessibilityMenu />
    </div>
  );
};

export default Layout;
