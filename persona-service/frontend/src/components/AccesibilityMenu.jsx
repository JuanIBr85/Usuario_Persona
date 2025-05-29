import React, { useState, useEffect } from 'react';

const AccessibilityMenu = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [isHighContrast, setIsHighContrast] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState(100); // %

    useEffect(() => {
        document.documentElement.style.filter = isHighContrast ? 'contrast(150%) grayscale(100%)' : 'none';
        document.documentElement.style.fontSize = `${fontSize}%`;
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isHighContrast, fontSize, isDarkMode]);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {showMenu && (
                <div className="mt-2 bg-card border shadow-lg rounded p-4 w-64 space-y-3">
                    <h2 className="font-bold text-lg">Accesibilidad</h2>

                    <div className="flex justify-between items-center">
                        <span>Tamaño de fuente</span>
                        <div className="space-x-2">
                            <button onClick={() => setFontSize((s) => Math.max(80, s - 10))} className="px-2 py-1 border rounded">A-</button>
                            <button onClick={() => setFontSize((s) => Math.min(150, s + 10))} className="px-2 py-1 border rounded">A+</button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span>Contraste alto</span>
                        <button
                            onClick={() => setIsHighContrast(!isHighContrast)}
                            className="px-2 py-1 border rounded"
                        >
                            {isHighContrast ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <span>Modo oscuro</span>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="px-2 py-1 border rounded"
                        >
                            {isDarkMode ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>
                </div>
            )}
            <button
                className="bg-[var(--color-primario)] text-white px-2 py-2 rounded-full shadow float-right"
                onClick={() => setShowMenu(!showMenu)}
                aria-expanded={showMenu}
                aria-label="Activar menú de accesibilidad"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-person-standing-icon lucide-person-standing"><circle cx="12" cy="5" r="1" /><path d="m9 20 3-6 3 6" /><path d="m6 8 6 2 6-2" /><path d="M12 10v4" /></svg>
            </button>
        </div>
    );
};

export default AccessibilityMenu;
