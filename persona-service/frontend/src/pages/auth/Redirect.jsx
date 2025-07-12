import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '@/components/loading/Loading';
import { useAuthContext } from '@/context/AuthContext';
import { componentService } from '@/services/componentService';
import { useState } from 'react';
import { PersonaService } from '@/services/personaService';


const Redirect = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { authData, encode, timeLeftToExpire, removeAuthData } = useAuthContext();
    const [loadingText, setLoadingText] = useState('Analizando consulta...');

    const validateToRedirect = async () => {
        //Valido que la sesion no expire en menos de 10 minutos
        if (timeLeftToExpire() < 60 * 10) {
            setLoadingText("Tu sesion expira en menos de 10 minutos vuelva a iniciar sesion para continuar");
            setTimeout(() => navigate('/auth/logout'), 2000);
            return;
        }

        //Valido que tenga un perfil
        try {
            setLoadingText("Validando que el perfil este creado");
            await PersonaService.persona_by_usuario();
            setLoadingText("Perfil encontrado");
        } catch (error) {
            setLoadingText("No se a completado los datos del perfil");
            setTimeout(() => navigate('/searchprofile'), 1000);
            return;
        }

        //Por que ago este timeout?
        //simple es por que queria que se viera el mensaje anterior.
        setTimeout(() => {
            const redirect = sessionStorage.getItem('_redirect');
            const b64Data = encode();

            //Si no se pudo convertir la informacion de auth en base64
            if (!b64Data) {
                setLoadingText("Hubo un problema al empaquetar la informacion");
                removeAuthData("Redirect");
                setTimeout(() => navigate('/auth/login'), 1000);
                return;
            }

            setLoadingText(`Redireccionando a ${redirect}`);

            //Es solo estetico el timeout, para que el usuario pueda ver el mensaje
            setTimeout(() => {
                //Borro el redirect para que perfil no siga mandando a redirect al usuario
                sessionStorage.removeItem('_redirect');
                window.location.href = `${redirect}?token=${b64Data}`;
            }, 1000);
        }, 1000);
    }

    useEffect(() => {
        //Si el usuario tiene un token y un redirect
        if (authData.user?.expires_in && sessionStorage.hasOwnProperty('_redirect')) {
            //Valido los datos y lo redirijo a donde corresponde
            validateToRedirect();
        } else {
            //Si el usuario entra con un codigo
            const code = searchParams.get('code');
            setLoadingText("Analizando codigo...")
            if (code) {
                //Valido el codigo y lo guardo en sessionStorage
                componentService.get_redirect(code).then((response) => {
                    setLoadingText("El codigo es valido")
                    sessionStorage.setItem('_redirect', response.data);
                })
                .catch((error) => {
                    setLoadingText("El codigo es invalido")
                })
                .finally(() => {
                    //Redirecciono al usuario para asegurarme de que inicie sesion
                    setTimeout(() => navigate('/auth/login'), 1000);
                });
            } else {
                //Si no hay codigo, redirecciono al usuario a login
                setLoadingText("No se encontro un codigo de redireccion")
                setTimeout(() => navigate('/auth/login'), 1000);
            }
        }
    }, []);

    return (
        <div>
            <Loading text={loadingText}></Loading>
        </div>
    );
};

export default Redirect;