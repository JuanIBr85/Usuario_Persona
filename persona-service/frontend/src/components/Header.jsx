import React, { useState } from "react";
import { Link } from "react-router-dom";
import Hamburger from 'hamburger-react'

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-[var(--color-primario)] text-white p-4 md:px-20">
            <div className="flex flex-row justify-between items-center">
                <div className="flex items-center" >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-book-open-icon lucide-book-open"><path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>
                    <h1 className="text-xl font-bold ml-2">CREUS</h1>
                </div>
                <div>
                    {/* Menú Escritorio */}
                    <ul className="hidden md:flex space-x-4">
                        <li><Link to="/" className="hover:underline">Home</Link></li>
                        <li><Link to="/about" className="hover:underline">About</Link></li>
                        <li><Link to="/services" className="hover:underline">Services</Link></li>
                        <li><Link to="/contact" className="hover:underline">Contact</Link></li>
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
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/services">Services</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                </ul>

            </div>

        </header>
    );
};

export default Header;
