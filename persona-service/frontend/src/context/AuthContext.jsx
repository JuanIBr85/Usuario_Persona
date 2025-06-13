import { createContext, useContext, useState, useEffect } from 'react';
import { SimpleDialog } from '@/components/SimpleDialog';


const AuthContext = createContext();

const defaultData = Object.freeze({
    token: "",
    otp_code: "",
    user: {
        id_usuario: 0,
        nombre_usuario: "",
        email_usuario: "",
        permisos: [],
        rol: "",
        expires_in:null//Date
    },
});

const _authData = localStorage.getItem("authData");
const saveAuthData = _authData ? JSON.parse(_authData) : defaultData;

function AuthContextProvider({ children }) {
    const [authData, setAuthData] = useState(saveAuthData);
    const [dialog, setDialog] = useState(null)

    useEffect(() => {
        // Verificar expiración del token cada minuto
        const interval = setInterval(() => {
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
            }
            
        }, 1000*30); // Verificar cada 30 segundos

        return () => clearInterval(interval);
    }, [authData.user?.expires_in]);

    const removeAuthData = ()=>{
        setAuthData(defaultData);
        localStorage.removeItem('authData');
        localStorage.removeItem('token');
    }

    const updateData = (values) => {
        setAuthData(data=>{
            const newData = {...data, ...values};
            localStorage.setItem("authData", JSON.stringify(newData));
            localStorage.setItem("token", newData.token);
            return newData;
        });
    };

    return (
        <AuthContext.Provider value={{authData, updateData, removeAuthData}}>
            {dialog && <SimpleDialog 
                title={dialog.title} 
                description={dialog.description} 
                isOpen={dialog} 
                actionHandle={() => setDialog(null)}
            />}
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => {
    return useContext(AuthContext);
};  

export default AuthContextProvider;
