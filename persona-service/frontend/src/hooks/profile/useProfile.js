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
  const [photoUrl, setPhotoUrl] = useState('https://i.pravatar.cc/150?img=69');
  const [dialog, setDialog] = useState(null);
  const [staticData, setStaticData] = useState({});
  const [showFormEmailVerify, setShowFormEmailVerify] = useState(false);

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
      const profileResponse = await PersonaService.get_by_usuario(authData.user.id_usuario);
      console.log(profileResponse);
      if (profileResponse?.data) {
        setPersonaData({
          ...initialPersonaState,
          ...profileResponse.data,
          contacto: profileResponse.data.contacto || {},
          domicilio: profileResponse.data.domicilio || {}
        });
      }
    } catch (error) {
      if(error.statusCode === 404){
        setShowFormEmailVerify(true);
        setDialog({
          title: "No hay un perfil",
          description: "Complete los datos de perfil para continuar",
          action: () => navigate('/perfilConnect')
        });
        
      }else{
        setDialog({
          title: "Error al cargar los datos",
          description: "Error al cargar los datos del perfil"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authData.token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [authData, navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  return {
    isLoading,
    personaData,
    photoUrl,
    email: authData.user?.email_usuario || '',
    staticData,
    handlePhotoChange,
    fetchData,
    setPersonaData,
    dialog, 
    showFormEmailVerify,
    setShowFormEmailVerify,
    setDialog
  };
}
