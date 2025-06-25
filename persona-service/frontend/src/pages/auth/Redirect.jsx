import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '@/components/loading/Loading';
import { useAuthContext } from '@/context/AuthContext';
import { componentService } from '@/services/componentService';

/**
 * Codifica un objeto JavaScript a Base64URL
 * @param {any} data - Datos a codificar
 * @returns {string|null} Cadena Base64URL o null si hay error
 */
function encodeData(data) {
    try {
        const json = JSON.stringify(data);
        const bytes = new TextEncoder().encode(json);
        const binary = String.fromCharCode(...bytes);
        const base64 = btoa(binary);

        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    } catch (error) {
        console.error("Error de codificación:", error);
        return null;
    }
}

/**
 * Decodifica una cadena Base64URL a objeto JavaScript
 * @param {string} base64Url - Cadena Base64URL a decodificar
 * @returns {any|null} Objeto original o null si hay error
 */
function decodeData(base64Url) {
    try {
        // Convertir Base64URL a Base64 estándar
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // Añadir padding si es necesario
        const padding = base64.length % 4;
        if (padding) base64 += '='.repeat(4 - padding);

        // Decodificar
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const json = new TextDecoder().decode(bytes);
        return JSON.parse(json);
    } catch (error) {
        console.error("Error de decodificación:", error);
        return null;
    }
}

const Redirect = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { authData } = useAuthContext();

    useEffect(() => {
        const code = searchParams.get('code');

        const _encodedData = encodeData(authData.user);
        const _decodedData = decodeData(_encodedData);

        console.log(_encodedData, _decodedData)


        componentService.get_redirect(code).then((response) => {
            sessionStorage.setItem('_redirect', response.data);

        }).finally(() => {
            //navigate('/auth/login');
        });
    }, []);

    return (
        <div>
            <Loading></Loading>
        </div>
    );
};

export default Redirect;