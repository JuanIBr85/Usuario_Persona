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
  const [tipoDocumento, setTipoDocumento] = useState([]);
  const [personaData, setPersonaData] = useState(initialPersonaState);
  const [photoUrl, setPhotoUrl] = useState('https://i.pravatar.cc/150?img=69');
  const [redes_sociales, setRedesSociales] = useState([]);
  const [dialog, setDialog] = useState(null);

  const fetchData = async () => {
    try {
      const [profileResponse, tiposDocumentoResponse, redes_socialesResponse] = await Promise.all([
        PersonaService.get_by_usuario(authData.user.id_usuario),
        PersonaService.get_tipos_documentos(),
        PersonaService.get_redes_sociales()
      ]);

      if (profileResponse?.data) {
        setPersonaData({
          ...initialPersonaState,
          ...profileResponse.data,
          contacto: profileResponse.data.contacto || {},
          domicilio: profileResponse.data.domicilio || {}
        });
      }

      setTipoDocumento(tiposDocumentoResponse?.data || []);
      setRedesSociales(redes_socialesResponse?.data || []);
    } catch (error) {
      if(error.statusCode === 404){
        setDialog({
          title: "No hay un perfil",
          description: "Complete los datos de perfil para continuar"
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
    tipoDocumento,
    personaData,
    photoUrl,
    email: authData.user?.email_usuario || '',
    redes_sociales,
    handlePhotoChange,
    fetchData,
    setPersonaData,
    dialog, 
    setDialog
  };
}
