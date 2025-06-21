import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Hamburger from "hamburger-react";
import { jwtDecode } from "jwt-decode";
import { set } from "date-fns";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded.rol)
      if (decoded.rol === "usuario") {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
    }

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
      <header className="fixed top-0 z-50 bg-[var(--color-primario)] text-white p-4 md:px-20 w-full">
        <div className="flex flex-row justify-between items-center">
          <NavLink to="/" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-book-open-icon lucide-book-open"
            >
              <path d="M12 7v14" />
              <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
            </svg>
            <h1 className="text-xl font-bold ml-2">CREUS</h1>
          </NavLink>
          <div>
            {/* Menú Escritorio */}
            <ul className="hidden md:flex space-x-4">
              <li>
                <NavLink
                  to="/adminpanel"
                  className={({ isActive }) =>
                    `${isAdmin ? "relative" : "hidden"}  text-white transition-all duration-100 ease-in-out
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
