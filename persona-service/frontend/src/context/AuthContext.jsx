import { createContext, useContext, useState, useEffect } from 'react';
import { SimpleDialog } from '@/components/SimpleDialog';
import { useNavigate } from 'react-router-dom';

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

const tempAuthData = {};

function AuthContextProvider({ children }) {
    const [authData, setAuthData] = useState(saveAuthData);
    const [dialog, setDialog] = useState(null);
    const navigate = useNavigate();

    const toLogout = () => {
        if (!window.location.pathname.includes("/auth/")) {
            window.location.href = '/auth/logout';
        }
    }

    const checkToken = () => {
        if (!authData.user?.expires_in) return;
        const now = new Date();
        const expirationDate = new Date(authData.user.expires_in);

        if (now > expirationDate) {
            // Token expirado, limpiar datos de autenticación
            removeAuthData();

            setDialog({
                title: "Sesión expirada",
                description: "Su sesión ha expirado. Por favor, inicie sesión de nuevo.",
            });

            setTimeout(toLogout, 1000 * 60);
        }

    };

    useEffect(() => {
        checkToken();
        const timeLeft = (new Date(authData.user.expires_in) - new Date()) / 1000;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);
        //alert(`Tu sesión expirará en ${minutes} minutos y ${seconds} segundos.`);
        // Verificar expiración del token cada minuto
        const interval = setInterval(checkToken, 1000 * 2); // Verificar cada 2 segundos
        if (!window.location.pathname.includes("/auth/")) {
            if (!authData.user?.expires_in) {
                setDialog({
                    title: "No deberias de estar aqui",
                    description: "Inicia sesion para ingresar",
                });
                navigate('/auth/login');
            }

            //Elimino el email para reset en caso de que el usuario salga de la seccion de autenticacion
            sessionStorage.removeItem("email_para_reset");
        }

        return () => clearInterval(interval);
    }, [authData.user?.expires_in]);

    const removeAuthData = () => {
        setAuthData(defaultData);
        localStorage.removeItem('authData');
        localStorage.removeItem('token');
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

    return (
        <AuthContext.Provider value={{ authData, updateData, removeAuthData }}>
            {dialog && <SimpleDialog
                title={dialog.title}
                description={dialog.description}
                isOpen={dialog}
                actionHandle={() => {
                    setDialog(null);
                    setTimeout(toLogout, 2000);
                }}
            />}
            {children}
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
