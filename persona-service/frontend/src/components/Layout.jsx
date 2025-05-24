import React from "react";
import Header from "./Header";
import Nav from "./Nav";
import Main from "./Main";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <Nav />
        <Main>{children}</Main>
      </div>
    </div>
  );
};

export default Layout;
