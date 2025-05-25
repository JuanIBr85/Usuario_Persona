import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Main from "./Main";
import AccessibilityMenu from './AccesibilityMenu';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <Main>{children}</Main>
      </div>
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Layout;
