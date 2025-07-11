import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/loading/Loading';
import { useAuthContext } from '@/context/AuthContext';
import { useState } from 'react';
import { PersonaService } from '@/services/personaService';

/**
 * SearchProfile.jsx
 *
 * Componente de transición utilizado luego del proceso de verificación o creación de perfil.
 * Se encarga de buscar el perfil asociado al usuario logueado y redirigirlo según corresponda.
 *
 * Flujo general:
 * - Se consulta al backend por el perfil asociado al usuario.
 * - Si el perfil existe:
 *   - Se actualiza el contexto global (`AuthContext`) con el `id_persona`.
 *   - Se eliminan posibles flags de espera de la localStorage.
 *   - Se redirige al usuario:
 *     - A `/auth/redirect` si existe `_redirect` en sessionStorage.
 *     - A `/profile` si no hay redirección pendiente.
 * - Si no existe el perfil:
 *   - Se actualiza el contexto con `id_persona: 0`.
 *   - Si está en espera de aprobación de administrador (`persona-esperando-persona`):
 *     - Se establece flag `persona-esperando-admin` con tiempo de espera.
 *     - Se redirige a `/auth/waiting`.
 *   - Si no, se redirige a `/profileconnect` para iniciar el proceso desde cero.
 *
 * Componentes utilizados:
 * - `Loading`: Indicador visual con texto variable según el estado del proceso.
 * - `useAuthContext`: Actualiza datos del usuario globalmente.
 * - `PersonaService`: Accede al backend para obtener datos del perfil.
 */

const SearchProfile = () => {
    const navigate = useNavigate();
    const { updateUserData } = useAuthContext(); //para actualizar el contexto de usuario
    const [loadingText, setLoadingText] = useState('Buscando perfil...');

    useEffect(()=>{
        PersonaService.persona_by_usuario().then((response)=>{
            setLoadingText("Perfil encontrado");
            updateUserData({
                id_persona: response.data.id_persona,
            });

            // Limpieza de flags relacionados al proceso de espera
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

                navigate("/auth/waiting"); // Redirige a pantalla de espera
                return;
            }
            // Si no está esperando, lo redirige a vinculación desde cero
            setTimeout(() => navigate('/profileconnect'), 500);
        });
    }, []);

    return (
        <div>
            {/* Componente de carga centralizado */}
            <Loading text={loadingText} isFixed></Loading>
        </div>
    );
}

export default SearchProfile;
