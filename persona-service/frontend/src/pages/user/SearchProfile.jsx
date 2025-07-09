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
