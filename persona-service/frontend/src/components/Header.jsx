import React, { useState } from "react";
import { Link } from "react-router-dom";
import Hamburger from 'hamburger-react'

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
        <div id="FAKE_HEADER" className="top-0 p-8 w-full"></div>
        <header className="fixed top-0 z-50 bg-[var(--color-primario)] text-white p-4 md:px-20 w-full">
            <div className="flex flex-row justify-between items-center">
                <div className="flex items-center" >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open-icon lucide-book-open"><path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>
                    <h1 className="text-xl font-bold ml-2">CREUS</h1>
                </div>
                <div>
                    {/* Menú Escritorio */}
                    <ul className="hidden md:flex space-x-4">
                        <li><Link to="/adminpanel">Panel de Administrador</Link></li>
                        <li><Link to="/profile">Perfil</Link></li>
                        <li><Link to="/logout">Cerrar Sesión</Link></li>
                    </ul>
                    <div className="md:hidden">
                        <Hamburger toggled={isOpen} toggle={setIsOpen} />
                    </div>
                </div>
            </div>
            <div>
                {/* Menú Celulares (Normalmente lo haría con un mismmo "navbar" pero usar grid en tailwind con media queries se hace largo)*/}
                <ul
                    className={`transition-all duration-500 ease-in-out overflow-hidden md:hidden flex flex-col space-y-4 px-4
                ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}
                >
                    <li><Link to="/adminpanel">Panel de Administrador</Link></li>
                    <li><Link to="/profile">Perfil</Link></li>
                    <li><Link to="/logout">Cerrar Sesión</Link></li>
                </ul>

            </div>

        </header>
        </>
    );
};

export default Header;
