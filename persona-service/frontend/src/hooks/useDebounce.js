import { useEffect, useRef } from 'react';

/**
 * Hook para ejecutar un método después de un tiempo desde el último cambio en una dependencia.
 * 
 * @param {Function} handler - Función a ejecutar después del tiempo de espera
 * @param {number} timeout - Tiempo de espera en milisegundos
 * @param {Array} deps - Dependencias para reiniciar el temporizador
 */
export function useDebounce(handler, timeout = 300, deps = []) {
    const timeoutId = useRef(0);
    
    useEffect(() => {
        clearTimeout(timeoutId.current);
        timeoutId.current = setTimeout(handler, timeout);
        
        // Limpieza al desmontar
        return () => clearTimeout(timeoutId.current);
    }, [handler, timeout, ...deps]);
}