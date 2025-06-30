import React from 'react';
import './Loading.css';
import { Ellipsis } from 'lucide-react';

/**
 * Loading
 *
 * Componente funcional de React que muestra una animación de carga moderna.
 * Simplificado usando únicamente clases de Tailwind CSS.
 *
 * @component
 * @param {boolean} isFixed - Indica si el loading debe estar fijo en la pantalla
 * @returns {JSX.Element} Un overlay con una animación de carga moderna y un texto accesible "Cargando...".
 */

function Loading({ isFixed = false,  text = null }) { //Lo de null es temporal
    const pos = isFixed 
        ? "fixed z-50 top-0 left-0 right-0 bottom-0 backdrop-blur-sm" 
        : "relative";
    
    return (
        <div 
            className={`flex flex-col items-center select-none justify-center w-full h-screen ${pos}`}
            role="status"
        >
            <div className="relative w-24 h-24 mb-4">
                {/* Círculo exterior con animación de pulso */}
                <div className="absolute inset-0 w-full h-full rounded-full bg-indigo-900 pulse-scale" />
                
                {/* Círculo interior giratorio */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-white border-r-white/60 border-b-white/40 border-l-white/60 rounded-full animate-spin">
                    </div>
                </div>
                
                {/* Punto central */}
                <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-white" />
                
                {/* Texto accesible */}
                <span className="sr-only">Cargando...</span>
            </div>
            
            {/* Texto opcional */}
            {text && (
                <p className="text-indigo-900 text-center font-medium mt-4">
                    {text}
                </p>
            )}
        </div>
    );
}

export default Loading;