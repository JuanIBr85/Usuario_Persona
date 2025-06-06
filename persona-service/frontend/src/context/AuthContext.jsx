import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const defaultData = Object.freeze({
    token: "",
    otp_code: "",
    user: {
        id_usuario: 0,
        nombre_usuario: "",
        email_usuario: "",
        permisos: [],
        rol: ""
    },
});

const _authData = localStorage.getItem("authData");
const saveAuthData = _authData ? JSON.parse(_authData) : defaultData;

function AuthContextProvider({ children }) {
    const [authData, setAuthData] = useState(saveAuthData);
    
    const updateData = (values) => {
        setAuthData(data=>{
            const newData = {...data, ...values};
            localStorage.setItem("authData", JSON.stringify(newData));
            localStorage.setItem("token", newData.token);
            console.log("AuthData updated:", newData);
            return newData;
        });
    };

    return (
        <AuthContext.Provider value={{authData, updateData}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => {
    return useContext(AuthContext);
};  

export default AuthContextProvider;
