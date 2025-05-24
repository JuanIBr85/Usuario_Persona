import React from "react";

const Nav = () => {
  return (
    <nav className="bg-gray-200 w-64 p-4">
      <ul>
        <li className="mb-2"><a href="#">Inicio</a></li>
        <li className="mb-2"><a href="#">Usuarios</a></li>
        <li className="mb-2"><a href="#">Configuración</a></li>
      </ul>
    </nav>
  );
};

export default Nav;
