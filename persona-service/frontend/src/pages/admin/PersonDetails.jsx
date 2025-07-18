import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loading from "@/components/loading/Loading";
import { X } from "lucide-react";

import { PersonaService } from "@/services/personaService";
import { useUsuariosBasic } from "@/hooks/users/useUsuariosBasic";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import PersonDetailsCard from "@/components/person-details/PersonDetailsCard";
import PersonEditDialog from "@/components/person-details/PersonEditDialog";
import PersonDetailsBreadcrumb from "@/components/person-details/PersonDetailsBreadcrumb";

/**
 * PersonDetails component
 *
 * Muestra los detalles de una persona específica obtenida por su ID desde la URL.
 * Permite visualizar y editar la información personal, de contacto y domicilio de la persona.
 * Gestiona la carga de datos auxiliares como tipos de documentos, redes sociales y localidades según el código postal.
 *
 * Estado:
 * - person: Objeto con los datos mapeados de la persona.
 * - editingPerson: Objeto con los datos de la persona en modo edición.
 * - redesSociales: Lista de redes sociales disponibles.
 * - tiposDocumentos: Lista de tipos de documentos disponibles.
 * - localidades: Lista de localidades filtradas por código postal.
 *
 * Efectos:
 * - Carga los datos de la persona al montar el componente o cambiar el ID.
 * - Carga las listas de redes sociales y tipos de documentos al montar.
 * - Carga las localidades cuando cambia el código postal en edición.
 *
 * Props: Ninguna.
 *
 * Dependencias:
 * - PersonaService: Servicio para obtener y editar datos de personas.
 * - useParams: Hook de React Router para obtener parámetros de la URL.
 * - PersonDetailsCard, PersonDetailsBreadcrumb, PersonEditDialog, Loading: Componentes auxiliares.
 *
 * @component
 */
function PersonDetails() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);

  const [person, setPerson] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [redesSociales, setRedesSociales] = useState([]);
  const [tiposDocumentos, setTiposDocumentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  const [postal, setPostal] = useState("");
  const {
    usuarios,
    loading,
    error,
  } = useUsuariosBasic();

  function showAlert(title, description, variant = "default") {

    let descriptionAlert = "Error al acualizar persona";
    try{
      if(typeof description === "string"){
        descriptionAlert = description;
      }else{
        descriptionAlert = "";
        for(let key in description){
          descriptionAlert += `${key}: ${description[key]}\n`;
        }

      }

    }catch(err){
      console.error("Error al mostrar alerta:", err);
    }
    
    setAlert({ title, description:descriptionAlert, variant });
    setTimeout(() => setAlert(null), 5000);
  }

  useEffect(() => {
    PersonaService.get_by_id(id)
      .then((res) => {
        if (res?.data) {
          const persona = res.data;
          setPerson(persona);
          setPostal(persona.domicilio.domicilio_postal.codigo_postal);
        }
      })
      .catch((err) => {
        showAlert(
          "Error",
          "No se pudo obtener la persona",
          "destructive"
        );
        console.error("Error al obtener la persona:", err);
      });
  }, [id]);

  useEffect(() => {
    PersonaService.get_redes_sociales().then((res) => {
      setRedesSociales(res?.data || []);
    });
    PersonaService.get_tipos_documentos().then((res) => {
      setTiposDocumentos(res?.data || {});
    });
  }, []);

  useEffect(() => {
    if (postal) {
      PersonaService.get_localidades_by_codigo_postal(postal)
        .then((res) => {
          setLocalidades(res?.data || []);
        });
    }
  }, [postal]);

  const handleEditSubmit = async (body) => {
    PersonaService.editar(id, body).then((res) => {
      if (res?.data) {
        const persona = res.data;
        setPerson(persona);
        setPostal(persona.domicilio.codigo_postal);
        showAlert("Persona editada", "Persona editada correctamente");
        setIsDialogOpen(false);
      }
    }).catch((err) => {
      showAlert("Error", err?.data?.error, "destructive");
    })
  };

  if (!person) {
    return <Loading />;
  }

  return (
    <div className="p-6 space-y-6">
      <PersonDetailsCard person={person} onEdit={() => setIsDialogOpen(true)} />
      <PersonDetailsBreadcrumb />
      {isDialogOpen && <PersonEditDialog
        open={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingPerson={person}
        changePostal={setPostal}
        onSubmit={handleEditSubmit}
        redesSociales={redesSociales}
        tiposDocumentos={tiposDocumentos} 
        localidades={localidades}
        usuarios={usuarios}
        loading={loading}
        error={error}
      />}
      {alert && (
        <div className="fixed bottom-16 right-4 z-50 w-96">
          <Alert
            variant={alert.variant || "default"}
            className="animate-in slide-in-from-right-8 duration-300 bg-card border-black"
          >
            <AlertTitle>{alert.title}</AlertTitle>
            {alert?.description && (
              <AlertDescription>{alert.description}</AlertDescription>
            )}
            <button
              onClick={() => setAlert(null)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default PersonDetails;