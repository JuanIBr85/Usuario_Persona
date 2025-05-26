import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Main from "./Main";
import AccessibilityMenu from './AccesibilityMenu';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideHeaderFooter = ["/login", "/sign"].includes(location.pathname);

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
