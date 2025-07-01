import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SimpleDialog } from '@/components/SimpleDialog';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';

const AuthContext = createContext();

const defaultData = Object.freeze({
    token: "",
    otp_code: "",
    user: {
        id_usuario: 0,
        nombre_usuario: "",
        email_usuario: "",
        rol: [],
        expires_in: null//Date
    },
});

const _authData = localStorage.getItem("authData");
const saveAuthData = _authData ? JSON.parse(_authData) : defaultData;

const tempAuthData = { ...saveAuthData };

function AuthContextProvider({ children }) {
    const [authData, setAuthData] = useState(saveAuthData);
    const [dialog, setDialog] = useState(null);
    const [checkTokenInterval, setCheckTokenInterval] = useState(null);
    const [logoutTimeout, setLogoutTimeout] = useState(null);
    const navigate = useNavigate();
    const [isUnauthorizedRoute, setIsUnauthorizedRoute] = useState(false);

    const timeLeftToExpire = () => (new Date(authData.user.expires_in) - new Date()) / 1000;

    // Función para limpiar todos los timers
    const cleanupTimers = () => {
        if (checkTokenInterval) {
            clearInterval(checkTokenInterval);
            setCheckTokenInterval(null);
        }
        if (logoutTimeout) {
            clearTimeout(logoutTimeout);
            setLogoutTimeout(null);
        }
    };

    // Función mejorada de logout
    const toLogout = () => {
        cleanupTimers();

        // Token expirado, limpiar datos de autenticación
        removeAuthData();
        setIsUnauthorizedRoute(false);
        if (!window.location.pathname.includes("/auth/")) {
            window.location.href = '/auth/login';
        }
    }

    // Función para verificar si el usuario está en una ruta de autenticación
    const isAuthRoute = () => {
        return window.location.pathname.includes("/auth/");
    };

    // Función para verificar si el token es válido
    const isTokenValid = () => {
        if (!authData.user?.expires_in) {
            return false;
        }

        const now = new Date();
        const expirationDate = new Date(authData.user.expires_in);

        return now <= expirationDate;
    }   ;

    // Función para mostrar dialog de sesión expirada
    const showSessionExpiredDialog = () => {
        // Limpiar cualquier dialog anterior
        setDialog(null);

        // Limpiar timers existentes
        cleanupTimers();

        const timeout = setTimeout(() => {
            toLogout();
        }, 10000); // 10 segundos para que el usuario vea el mensaje

        setLogoutTimeout(timeout);

        setDialog({
            title: "Sesión expirada",
            description: "Su sesión ha expirado. Por favor, inicie sesión de nuevo.",
            timeout: timeout,
            action: () => navigate('/auth/login')
        });
    };

    // Función para mostrar dialog de usuario no autorizado
    const showUnauthorizedDialog = (message = "No tienes permiso para acceder a esta página") => {
        // Limpiar cualquier dialog anterior
        setDialog(null);

        // Limpiar timers existentes
        cleanupTimers();

        const timeout = setTimeout(() => {
            toLogout();
        }, 10000); // 10 segundos para que el usuario vea el mensaje

        setLogoutTimeout(timeout);
        setIsUnauthorizedRoute(true);
        setDialog({
            title: "No autorizado",
            description: message,
            timeout: timeout,
            action: () => navigate('/auth/login')
        });
    };

    // Función principal de verificación de token
    const checkToken = () => {
        // Si está en ruta de autenticación, limpiar flags y no verificar
        if (isAuthRoute()) {
            sessionStorage.removeItem("unauthorized_401");
            setIsUnauthorizedRoute(false);
            return;
        }

        // Verificar flag de 401 no autorizado
        if (sessionStorage.getItem("unauthorized_401")) {
            sessionStorage.removeItem("unauthorized_401");
            showUnauthorizedDialog("No tienes permiso para acceder a esta página");
            return;
        }

        // Verificar validez del token
        if (!isTokenValid()) {
            setIsUnauthorizedRoute(true);
            showSessionExpiredDialog();
            return;
        }

        // Si llegamos aquí, el token es válido - limpiar cualquier dialog existente
        if (dialog) {
            setDialog(null);
            cleanupTimers();
        }
    };

    // Función para verificación inicial al cargar la aplicación
    const performInitialCheck = () => {
        if (isAuthRoute()) return;

        // Limpiar email para reset
        sessionStorage.removeItem("email_para_reset");
        
        // Si no está en ruta de auth y no tiene token válido, mostrar dialog
        if (!isTokenValid()) {
            showUnauthorizedDialog("Inicia sesión para ingresar");
            return;
        }

    };

    useEffect(() => {
        // Realizar verificación inicial
        performInitialCheck();

        // Configurar verificación periódica 
        const interval = setInterval(checkToken, 30000);
        setCheckTokenInterval(interval);

        // Cleanup al desmontar
        return () => {
            clearInterval(interval);
            if (logoutTimeout) {
                clearTimeout(logoutTimeout);
            }
        };
    }, [authData.user?.expires_in]);

    const removeAuthData = () => {
        AuthService.logout()
            .finally(() => {
                setAuthData(defaultData);
                localStorage.removeItem('authData');
                localStorage.removeItem('token');
                Object.assign(tempAuthData, defaultData);
            });
    }

    const updateData = (values) => {
        setAuthData(data => {
            const newData = { ...data, ...values };
            localStorage.setItem("authData", JSON.stringify(newData));
            localStorage.setItem("token", newData.token);
            Object.assign(tempAuthData, newData);
            return newData;
        });
    };

    /**
     * Codifica en Base64URL los datos del autenticacion
     * @returns {string|null} Cadena Base64URL o null si hay error
     */
    const encode = () => {
        try {
            const json = JSON.stringify(authData.user);
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
    };

    /**
     * Decodifica una cadena Base64URL y actualiza los datos de autenticación
     * @param {string} base64Url - Cadena Base64URL a decodificar
     * @returns {any|null} Objeto original o null si hay error
     */
    const decode = (base64Url) => {
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

            const data = JSON.parse(json);

            //Actualizo los datos de auth
            updateData(data);

            return data;
        } catch (error) {
            console.error("Error de decodificación:", error);
            return null;
        }
    }

    // Función pública para marcar usuario como no autorizado
    const unauthorizedUser = (message) => {
        const errorMessage = typeof message === 'object' ? message.message : message;
        showUnauthorizedDialog(errorMessage);
    }

    // Función para cerrar dialog y ejecutar acción
    const handleDialogAction = useCallback(() => {
        const currentDialog = dialog;
        setDialog(null);
        setIsUnauthorizedRoute(false);
        if (currentDialog?.timeout) {
            clearTimeout(currentDialog.timeout);
            setLogoutTimeout(null);
        }

        if (currentDialog?.action) {
            currentDialog.action();
        }
    }, [dialog]);

    return (
        <AuthContext.Provider value={{
            authData,
            updateData,
            removeAuthData,
            encode,
            decode,
            timeLeftToExpire,
            unauthorizedUser
        }}>
            {dialog && <SimpleDialog
                title={dialog.title}
                description={dialog.description}
                isOpen={dialog}
                actionHandle={handleDialogAction}
            />}
            { !isUnauthorizedRoute && children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const hasRole = (role) => {
    return (tempAuthData?.user?.rol.includes(role)) ?? false;
}

export const isAdmin = () => {
    return hasRole("admin") || hasRole("superadmin");
}

export const isSuperAdmin = () => {
    return hasRole("superadmin");
}

export const isUsuario = () => {
    return hasRole("usuario");
}

export default AuthContextProvider;