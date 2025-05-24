import React from "react";
import Header from "./Header";
import Main from "./Main";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <Main>{children}</Main>
      </div>
    </div>
  );
};

export default Layout;
