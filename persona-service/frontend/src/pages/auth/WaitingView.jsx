import Loading from "@/components/loading/Loading";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { hasToken } from "@/context/AuthContext";

const {
    VITE_PAGINA_WEB: paginaWeb = 'coronelsuarez.gob.ar',
    VITE_TELEFONOS: telefonos = '2926429200;2926429371',
    VITE_EMAILS: emails = 'coronelsuarez@gob.ar',
    VITE_DIRECCION: direccion = 'Av. Alsina 150 (7540) Coronel Suárez Buenos Aires - Argentina',
    VITE_DIRECCION_URL: direccionUrl = 'https://www.openstreetmap.org/#map=20/-37.4445931/-61.9241133&layers=H',
    VITE_FACEBOOK: facebook = 'https://www.facebook.com/suarezmunicipio/?locale=es_LA',
    VITE_INSTAGRAM: instagram = 'https://www.instagram.com/suarezmunicipio/?hl=es'
  } = import.meta.env;


/*
Esta vista esta pensada para retener al usuario para evitar que intente vincularse continuamente de forma inecesaria.
Solo retiene al usuario hasta cumplir el plazo, si el usuario no se vincula en el plazo, se redirige a la pantalla de login.
*/
export default function WaitingView() {
    const navigate = useNavigate();
    const [timeLeftHours, setTimeLeftHours] = useState(0);
    const [timeLeftMinutes, setTimeLeftMinutes] = useState(0);
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
    const [count, setCount] = useState(0);

    // Actualiza el tiempo restante
    function timeLeftUpdate() {
        const expirationTime = localStorage.getItem("persona-esperando-admin");
        // Si no hay tiempo de expiracion, redirige a la pantalla de login
        if(!expirationTime){
            navigate("/auth/login");
            return;
        }
        const expirationDate = new Date(expirationTime);
        // Si el tiempo de expiracion ha llegado, redirige a la pantalla de login
        if (expirationDate < new Date()) {
            localStorage.removeItem("persona-esperando-admin");
            //Marco que el usuario esta esperando a que un admin lo vincule
            //Para saber si ponerlo en espera nuevamente
            localStorage.setItem("persona-esperando-persona", "true");
            
            navigate("/auth/login");
        }
        // Si el tiempo de expiracion no ha llegado, actualiza el tiempo restante
        const timeLeft = expirationDate - new Date();
        setTimeLeftHours(Math.floor(timeLeft / 1000 / 60 / 60));
        setTimeLeftMinutes(Math.floor((timeLeft / 1000 / 60) % 60));
        setTimeLeftSeconds(Math.floor((timeLeft / 1000) % 60));
    }

    useEffect(() => {
        // Si el usuario esta esperando a que un admin lo vincule
        if (localStorage.getItem("persona-esperando-persona")) {
            // Aumento el contador de intentos en 1
            const count = (Number(localStorage.getItem("persona-esperando-admin-count")) || 1);
            setCount(5-count);
            // Si el contador de intentos es mayor o igual a 5, redirige a la pantalla de login
            if (count >= 5) {
                //Elimino las flags de espera
                localStorage.removeItem("persona-esperando-admin");
                localStorage.removeItem("persona-esperando-persona");
                localStorage.removeItem("persona-esperando-admin-count");
                //Si el usuario esta autenticado, redirige a la pantalla de busqueda de perfil
                //Si el usuario no esta autenticado, redirige a la pantalla de login
                if(hasToken()){
                    navigate("/searchprofile");
                }else{
                    navigate("/auth/login");
                }
                return
            }else{
                //Incremento el contador de intentos
                localStorage.setItem("persona-esperando-admin-count", count );
            }
            //Elimino la flag de espera
            localStorage.removeItem("persona-esperando-persona");
        }else{
            setCount(5);
        }
        //Actualizo el tiempo restante
        timeLeftUpdate();
        //Actualizo el tiempo restante cada segundo
        const interval = setInterval(timeLeftUpdate, 1000);
        return () => clearInterval(interval);
    }, []);

    //Actualiza el mensaje
    function updateMessage(){
        return <>
            {`Esperando a que un administrador te vincule, vuelva a intentar en ${timeLeftHours.toString().padStart(2, '0')}:${timeLeftMinutes.toString().padStart(2, '0')}:${timeLeftSeconds.toString().padStart(2, '0')}`}
            <br/>
            Esta pantalla no desaparecera hasta que el administrador te vincule o se repita {count} veces.
            <br/>
            Pagina web: <a href={`https://${paginaWeb}`}>{paginaWeb}</a>
            <br/>
            Telefono: {telefonos.split(';').map((telefono, index) => (
                <a
                  key={index}
                  href={`tel:${telefono.replace(/[\D+]/g, '')}`}
                  aria-label="Nuestro teléfono"
                  title="Nuestro teléfono"
                  className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800 mr-1"
                >
                  {telefono}
                </a>
              ))}
            <br/>
            Correo: <a href={`mailto:${emails}`}>{emails}</a>
            <br/>
            Dirección: <a href={direccionUrl} target="_blank" rel="noopener noreferrer" aria-label="Nuestra dirección" title="Nuestra dirección" className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800">
              {direccion}
            </a>
        </>
    }


    return (
        <div>
            <Loading text={updateMessage()}></Loading>
        </div>
    );
}