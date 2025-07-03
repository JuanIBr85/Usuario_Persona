import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Hamburger from "hamburger-react";

import {isAdmin} from "@/context/AuthContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [_isAdmin, setIsAdmin] = useState(false);

  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {

    setIsAdmin(isAdmin());

    function handleClickOutside(e) {
      if (
        mobileMenuRef &&
        !mobileMenuRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div id="FAKE_HEADER" className="top-0 p-8 w-full"></div>{" "}
      {/* FAKE_HEADER Ayuda a mantener el contenido de las paginas fuera del header (al ser este 'fixed') */}
      <header className="fixed top-0 z-50 bg-[var(--color-primario)] text-white p-4 md:px-20 w-full shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
        <div className="flex flex-row justify-between items-center">
          <NavLink to={_isAdmin?"/":"/profile"} className="flex items-center">
          <svg fill="#ffff" className="w-1/12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.485,16.857l10,6c.027.016.057.023.084.036s.057.026.087.038a.892.892,0,0,0,.688,0c.03-.012.058-.024.087-.038s.057-.02.084-.036l10-6a1,1,0,0,0,.3-1.438l-10-14c-.013-.018-.035-.024-.049-.04a.962.962,0,0,0-1.53,0c-.014.016-.036.022-.049.04l-10,14a1,1,0,0,0,.3,1.438ZM13,20.234V5.121L20.557,15.7ZM11,5.121V20.234L3.443,15.7Z"/></svg>
            <h1 className="text-xl font-bold ml-2">PRISMA</h1>
          </NavLink>
          <div>
            {/* Menú Escritorio */}
            <ul className="hidden md:flex space-x-4">
              <li>
                <NavLink
                  to="/adminpanel"
                  className={({ isActive }) =>
                    `${_isAdmin ? "relative" : "hidden"}  text-white transition-all duration-100 ease-in-out
                                    ${
                                      isActive
                                        ? "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-white after:origin-left after:scale-x-100 after:transition-transform after:duration-300"
                                        : "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-white after:origin-left after:scale-x-0 after:transition-transform after:duration-300"
                                    }`
                  }
                >
                  Panel de Administrador
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `relative text-white transition-all duration-100 ease-in-out
                                    ${
                                      isActive
                                        ? "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-white after:origin-left after:scale-x-100 after:transition-transform after:duration-300"
                                        : "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-white after:origin-left after:scale-x-0 after:transition-transform after:duration-300"
                                    }`
                  }
                >
                  Perfil
                </NavLink>
              </li>
              <li>
                <NavLink to="/auth/logout">Cerrar Sesión</NavLink>
              </li>
            </ul>
            <div className="md:hidden" ref={hamburgerRef}>
              <Hamburger toggled={isOpen} toggle={setIsOpen} />
            </div>
          </div>
        </div>
        <div ref={mobileMenuRef}>
          {/* Menú Celulares (Normalmente lo haría con un mismmo "navbar" pero usar grid en tailwind con media queries se hace largo)*/}
          <ul
            className={`transition-all duration-500 ease-in-out overflow-hidden md:hidden flex flex-col space-y-4 px-4
                ${
                  isOpen
                    ? "max-h-96 opacity-100 mt-4"
                    : "max-h-0 opacity-0 mt-0 pointer-events-none"
                }`}
          >
            <li>
              <NavLink to="/adminpanel" onClick={() => setIsOpen(false)}>
                Panel de Administrador
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" onClick={() => setIsOpen(false)}>
                Perfil
              </NavLink>
            </li>
            <li>
              <NavLink to="/auth/logout" onClick={() => setIsOpen(false)}>
                Cerrar Sesión
              </NavLink>
            </li>
          </ul>
        </div>
      </header>
    </>
  );
};

export default Header;
