import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "@/context/AuthContext";
import { PersonaService } from '@/services/personaService';

const initialPersonaState = Object.freeze({
  nombre_persona: '',
  apellido_persona: '',
  tipo_documento: 'DNI',
  num_doc_persona: '',
  fecha_nacimiento_persona: '',
  contacto: {
    telefono_movil: '',
    telefono_fijo: '',
    red_social_contacto: ''
  },
  domicilio: {
    domicilio_calle: '',
    domicilio_numero: '',
    domicilio_piso: '',
    domicilio_dpto: '',
    domicilio_postal: {
      codigo_postal: '',
      localidad: '',
      partido: '',
      provincia: ''
    }
  }
});

export function useProfile() {
  const navigate = useNavigate();
  const { authData } = useAuthContext();

  const [isLoading, setIsLoading] = useState(true);
  const [personaData, setPersonaData] = useState(initialPersonaState);
  const [dialog, setDialog] = useState(null);
  const [staticData, setStaticData] = useState({});
  const [showFormEmailVerify, setShowFormEmailVerify] = useState(false);

  const [isCriticalError, setIsCriticalError] = useState(false);

  const fetchData = async () => {
    try {
      const [tiposDocumentoResponse, redes_socialesResponse, estados_civilesResponse, ocupacionesResponse, estudios_alcanzadosResponse] = await Promise.all([
        PersonaService.get_tipos_documentos(),
        PersonaService.get_redes_sociales(),
        PersonaService.get_estados_civiles(),
        PersonaService.get_ocupaciones(),
        PersonaService.get_estudios_alcanzados()
      ]);

      setStaticData({
        estados_civiles: estados_civilesResponse?.data || [],
        ocupaciones: ocupacionesResponse?.data || [],
        estudios_alcanzados: estudios_alcanzadosResponse?.data || [],
        tipos_documento: tiposDocumentoResponse?.data || [],
        redes_sociales: redes_socialesResponse?.data || []
      });
      const profileResponse = await PersonaService.persona_by_usuario();
      //console.log(profileResponse);
      if (profileResponse?.data) {

        //Si se esta esperando una redireccion, redirigira directamente hacia redirect,
        //Para que este se encargue de redirigir al usuario a la pagina correcta
        if(sessionStorage.getItem('_redirect')){
          navigate("/auth/redirect");
        }

        setPersonaData({
          ...initialPersonaState,
          ...profileResponse.data,
          contacto: profileResponse.data.contacto || {},
          domicilio: profileResponse.data.domicilio || {}
        });
      }
    } catch (error) {
      if (error.statusCode === 404) {
        setShowFormEmailVerify(true);
        setDialog({
          title: "No hay un perfil",
          description: "Complete los datos de perfil para continuar",
          action: () => navigate('/perfilConnect')
        });

      } else {
        console.error(error);
        setIsCriticalError(true);
        setDialog({
          title: "Error al cargar los datos",
          description: "Error al cargar los datos del perfil",
          action: () => navigate('/*')
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authData]);

  return {
    isLoading,
    personaData,
    email: authData.user?.email_usuario || '',
    staticData,
    fetchData,
    setPersonaData,
    dialog,
    showFormEmailVerify,
    setShowFormEmailVerify,
    setDialog,
    isCriticalError
  };
}
