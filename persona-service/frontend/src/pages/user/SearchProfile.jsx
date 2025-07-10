//SearchProfile
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/loading/Loading';
import { useAuthContext } from '@/context/AuthContext';
import { useState } from 'react';
import { PersonaService } from '@/services/personaService';

const SearchProfile = () => {
    const navigate = useNavigate();
    const { updateUserData } = useAuthContext();
    const [loadingText, setLoadingText] = useState('Buscando perfil...');

    useEffect(()=>{
        PersonaService.persona_by_usuario().then((response)=>{
            setLoadingText("Perfil encontrado");
            updateUserData({
                id_persona: response.data.id_persona,
            });

            //Elimino las flags de espera
            localStorage.removeItem("persona-esperando-admin");
            localStorage.removeItem("persona-esperando-persona");
            localStorage.removeItem("persona-esperando-admin-count");

            //Si se esta esperando una redireccion, redirigira directamente hacia redirect,
            //Para que este se encargue de redirigir al usuario a la pagina correcta
            if(sessionStorage.getItem('_redirect')){
                setLoadingText("Se encontro un codigo de redireccion");
                setTimeout(() => navigate("/auth/redirect"), 500);
            }else{
                setTimeout(() => navigate('/profile'), 500);
            }
        })
        .catch((error)=>{
            setLoadingText("No se a completado los datos del perfil");
            updateUserData({
                id_persona: 0,
            });
            
            //Si esta esperando a que un admin lo vincule lo mando a esperar
            if(localStorage.getItem("persona-esperando-persona")){
                const expirationTime = new Date();
                expirationTime.setMinutes(expirationTime.getMinutes() + 1);
                //expirationTime.setHours(expirationTime.getHours() + 1);
                localStorage.setItem("persona-esperando-admin", expirationTime.toISOString());

                navigate("/auth/waiting");
                return;
            }
            setTimeout(() => navigate('/profileconnect'), 500);
        });
    }, []);

    return (
        <div>
            <Loading text={loadingText} isFixed></Loading>
        </div>
    );
}

export default SearchProfile;
