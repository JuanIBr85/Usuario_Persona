import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SimpleDialog } from '@/components/SimpleDialog';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import {AuthRouteConfig} from "@/routes/AuthRouteConfig";
import { hasAccess } from '@/routes/AuthRouteConfig';

const AuthContext = createContext();

const defaultData = Object.freeze({
    token: "",
    otp_code: "",
    user: {
        access_jti: "",
        email_usuario: "",
        expires_in: null, // Date
        id_usuario: 0,
        id_persona: 0,
        nombre_usuario: "",
        refresh_expires: "",
        refresh_jti: "",
        refresh_token: "",
        rol: [],
        token: ""
    },
});

const _authData = localStorage.getItem("authData");
const saveAuthData = _authData ? JSON.parse(_authData) : defaultData;

//Datos de autenticación temporales para verificar roles
const tempAuthData = { ...saveAuthData };

// Función para verificar si el usuario está en una ruta de autenticación
const isPublicRoute = () => {
    return window.location.pathname.includes("/auth/") || window.location.pathname.includes("/faq/");
};

//Funcion para crear dialogos
const makeDialog = ({ title, description, action, timeout }) => ({
    title,
    description,
    action,
    timeout
});

function AuthContextProvider({ children }) {
    const [authData, setAuthData] = useState(saveAuthData);
    const [dialog, _setDialog] = useState(null);
    const _navigate = useNavigate();
    const [isUnauthorizedRoute, setIsUnauthorizedRoute] = useState(true);
    const [isFirstCheck, setIsFirstCheck] = useState(true);
    const location = useLocation();

    const timeLeftToExpire = () => (new Date(authData.user.expires_in) - new Date()) / 1000;

    // Función para verificar si el token es válido
    const isTokenValid = () => {
        if (!authData.user?.expires_in) {
            console.error("No se encontro fecha de expiracion del token", authData);
            return false;
        }

        const now = new Date(Date.now() + 60000);
        const expirationDate = new Date(authData.user.expires_in);
        return now <= expirationDate;
    };

    const setDialog = (_dialog) => {
        //Si hay un dialogo activo no se permite reemplazarlo por otro
        //Pero si por un null o undefined se permite
        if (dialog && !_dialog) {
            //Elimino el timeout del dialogo anterior para evitar problemas
            clearTimeout(dialog?.timeout);
            _setDialog(_dialog);
            return;
        }

        _setDialog(_dialog);
    };

    const updateData = (values) => {
        setAuthData(data => {
            const newData = { ...data, ...values };

            localStorage.setItem("authData", JSON.stringify(newData));
            localStorage.setItem("token", newData.token);
            Object.assign(tempAuthData, newData);
            //console.log("Datos de autenticación actualizados", newData);
            //console.log("Datos de usuario actualizados", newData.user);
            return newData;
        });
    };

    const updateUserData = (values) => {
        updateData({
            user: { ...authData.user, ...values }
        })
    };


    const removeAuthData = (rason) => {
        if (!rason) {
            throw new Error("No se proporciono una razon para eliminar los datos de autenticación");
        }

        console.warn(`Se eliminaron los datos de autenticación por: ${rason} a las ${new Date().toLocaleString()}`);

        AuthService.logout()
            .finally(() => {
                localStorage.removeItem('token');
            });

        setAuthData(defaultData);
        localStorage.removeItem('authData');
        Object.assign(tempAuthData, defaultData);
    }


    const navigate = useCallback(
        async (path, rason) => {
            removeAuthData(rason);
            sessionStorage.removeItem("unauthorized_401");
            //await _navigate(path);
            //Me aseguro de que se recargue la pagina
            window.location.href="/auth/login";
        },
        [_navigate]
    );


    const checkAuth = () => {
        if (isPublicRoute()) {
            //Evitar cualquier error por dialogo de autorizacion
            sessionStorage.removeItem("unauthorized_401");
            return true;
        }

        // Limpiar email para reset
        sessionStorage.removeItem("email_para_reset");

        //Si fetchUtil detecta un codigo 401 se almacena en sessionStorage
        if (sessionStorage.getItem("unauthorized_401")) {
            setIsUnauthorizedRoute(true);
            setDialog(makeDialog({
                title: "No autorizado",
                description: "No tienes permiso para acceder a esta página",
                action: () => navigate('/auth/login', "unauthorized_401"),
                timeout: setTimeout(() => {
                    navigate('/auth/login', "unauthorized_401 timeout");
                }, 10000)
            }));
            return false;
        }

        //Comprobamos si el token es valido
        if (!isTokenValid()) {
            setIsUnauthorizedRoute(true);
            setDialog(makeDialog({
                title: "No autorizado",
                description: "No tienes permiso para acceder a esta página",
                action: () => navigate('/auth/login', "Token invalido"),
                timeout: setTimeout(() => {
                    navigate('/auth/login', "Token invalido timeout");
                }, 10000)
            }));
            return false;
        }

        return true;
    }

    //Verifica si el usuario esta autenticado al cambiar la ruta
    useEffect(() => {
        let check = false;
        if (!isUnauthorizedRoute || isFirstCheck) {
            check = checkAuth();
            setIsUnauthorizedRoute(!check);
            setTimeout(() => setIsFirstCheck(false), 1000);
        }

        if(check && !hasAccess(location.pathname)){
            _navigate("/searchprofile")
        }
        
    }, [location]);

    //Verifica si el usuario esta autenticado al cambiar la ruta
    useEffect(() => {
        if (!(authData.user?.expires_in)) return;
        const interval = setInterval(() => {
            if (isPublicRoute()) return;
            if (isTokenValid()) return;
            //console.log("Token expirado");
            setDialog({
                title: "Sesión expirada",
                description: "Su sesión ha expirado. Por favor, inicie sesión de nuevo.",
                action: () => navigate('/auth/login', "Token expirado"),
                timeout: setTimeout(() => {
                    navigate('/auth/login', "Token expirado timeout");
                }, 10000)
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [authData.user?.expires_in]);



    // Función para cerrar dialog y ejecutar acción
    const handleDialogAction = useCallback(() => {
        const currentDialog = dialog;
        setDialog(null);
        if (currentDialog?.timeout) {
            clearTimeout(currentDialog.timeout);
        }

        if (currentDialog?.action) {
            currentDialog.action();
        }
    }, [dialog]);

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

            //Remplaza caracteres conflictivos para poder mandarlo por url
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
            // Converte Base64URL a Base64 estándar
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

            // Añadir padding si es necesario
            const padding = base64.length % 4;
            if (padding) base64 += '='.repeat(4 - padding);

            // Decodifica
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            //Convierte los bytes a json string
            const json = new TextDecoder().decode(bytes);

            //Convierte el json string a objeto
            const data = JSON.parse(json);

            //Actualiza los datos de auth
            updateData(data);

            return data;
        } catch (error) {
            console.error("Error de decodificación:", error);
            return null;
        }
    }
    // Función pública para marcar usuario como no autorizado
    const unauthorizedUser = (message) => {
        if (dialog || isUnauthorizedRoute) return;
        setIsUnauthorizedRoute(true);
        const errorMessage = typeof message === 'object' ? message.message : message;

        setDialog({
            title: "No autorizado",
            description: errorMessage,
            action: async () => {
                //await _navigate('/searchprofile');
                //Me aseguro de que se recargue la pagina
                window.location.href = "/searchprofile";
                //location.reload();
                setIsUnauthorizedRoute(false);
            },
        });
    }


    return (
        <AuthContext.Provider value={{
            authData,
            updateData,
            removeAuthData,
            encode,
            decode,
            timeLeftToExpire,
            unauthorizedUser,
            updateUserData
        }}>
            {dialog && <SimpleDialog
                title={dialog.title}
                description={dialog.description}
                isOpen={dialog}
                actionHandle={handleDialogAction}
            />}
            {!isUnauthorizedRoute && children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const hasRol = (role) => {
    if(!tempAuthData?.user?.rol) return false;
    return (tempAuthData?.user?.rol.includes(role)) ?? false;
}

export const isAdmin = () => {
    if(!tempAuthData?.user?.rol) return false;

    return Array.from(tempAuthData?.user?.rol).find((rol) => rol.toLowerCase().includes("admin")) ?? isSuperAdmin();
}

export const isSuperAdmin = () => {
    return hasRol("superadmin");
}

export const isUsuario = () => {
    return hasRol("usuario");
}

export const hasToken = () => {
    return tempAuthData?.user?.expires_in !== null && tempAuthData?.user?.expires_in !== undefined;
}

export const hasProfile = () => {
    return tempAuthData?.user?.id_persona && tempAuthData?.user?.id_persona !== 0;
}

export default AuthContextProvider;