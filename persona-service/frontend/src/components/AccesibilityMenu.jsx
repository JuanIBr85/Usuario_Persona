import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Fade } from 'react-awesome-reveal'

//Carga los datos de accesibilidad desde localStorage o usa valores por defecto
const data = localStorage.getItem('AccessibilityData');
const defaultData = Object.freeze({
    isHighContrast: false,
    isDarkMode: false,
    fontSize: 100,
    fontType: ''
});

const _accessibilityData = data ? JSON.parse(data) : { ...defaultData };

const AccessibilityMenu = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [accessibilityData, setAccessibilityData] = useState(_accessibilityData);


    useEffect(() => {
        document.documentElement.style.filter = accessibilityData.isHighContrast ? 'contrast(150%) grayscale(100%)' : 'none';
        document.documentElement.style.fontSize = `${accessibilityData.fontSize}%`;
        document.documentElement.classList.toggle('dark', accessibilityData.isDarkMode);

        document.documentElement.classList.toggle('font-dyslexia', accessibilityData.fontType === 'font-dyslexia');
        document.documentElement.classList.toggle('font-low-vision', accessibilityData.fontType === 'low-vision');

        // Carga los datos de accesibilidad al localStorage
        localStorage.setItem('AccessibilityData', JSON.stringify(accessibilityData));
    }, [accessibilityData]);

    //Actualiza los datos de accesibilidad
    const updateAccessibilityData = (newData) => {
        setAccessibilityData((prevData) => ({
            ...prevData,
            ...newData
        }));
    };

    //Actualiza el tamaño de fuente
    const changeFontSize = (size) => {
        updateAccessibilityData({ fontSize: Math.max(80, Math.min(150, accessibilityData.fontSize + size)) });
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 select-none ">
            {showMenu && (
                <Fade duration={400} triggerOnce>

                    <div className="mt-2 mb-3 bg-card border shadow-lg rounded p-4 w-72 space-y-3">
                        <h2 className="font-bold text-lg">Accesibilidad</h2>

                        <div className="flex justify-between items-center">
                            <span>Tamaño de fuente</span>
                            <div className="flex">
                                <button onClick={() => changeFontSize(-5)} className="px-2 py-1 border rounded cursor-pointer">A-</button>
                                <span className='flex items-center justify-center'>{accessibilityData.fontSize}%</span>
                                <button onClick={() => changeFontSize(5)} className="px-2 py-1 border rounded cursor-pointer">A+</button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span>Tipo de fuente</span>
                            <select
                                value={accessibilityData.fontType}
                                onChange={(e) => updateAccessibilityData({ fontType: e.target.value })}
                                className="px-2 py-1 border rounded cursor-pointer bg-card"
                            >
                                <option value="">Por defecto</option>
                                <option value="font-dyslexia">Para dislexia</option>
                                <option value="low-vision">Baja visión</option>
                            </select>
                        </div>

                        <div className="flex justify-between items-center">
                            <span>Contraste alto</span>
                            <button
                                className="px-2 py-1 border rounded cursor-pointer"
                                onClick={() => updateAccessibilityData({ isHighContrast: !accessibilityData.isHighContrast })}
                            >
                                {accessibilityData.isHighContrast ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>

                        <div className="flex justify-between items-center">
                            <span>Modo oscuro</span>
                            <button
                                onClick={() => updateAccessibilityData({ isDarkMode: !accessibilityData.isDarkMode })}
                                className="px-2 py-1 border rounded cursor-pointer"
                            >
                                {accessibilityData.isDarkMode ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>

                        <Button onClick={() => setAccessibilityData(defaultData)} className="w-full cursor-pointer">Por defecto</Button>
                    </div>
                </Fade>
            )}
            <button
                className="bg-[var(--color-primario)] text-white px-2 py-2 rounded-full shadow float-right cursor-pointer"
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
