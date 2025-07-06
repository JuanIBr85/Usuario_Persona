import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loading from "@/components/loading/Loading";

import { PersonaService } from "@/services/personaService";
import { useUsuariosBasic } from "@/hooks/users/useUsuariosBasic";


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
    setIsDialogOpen(false);
    PersonaService.editar(id, body).then((res) => {
      if (res?.data) {
        const persona = res.data;
        setPerson(persona);
        setPostal(persona.domicilio.codigo_postal);
      }
    })
  };

  if (!person) {
    return <Loading />;
  }

  return (
    <div className="p-6 space-y-6">
      <PersonDetailsCard person={person} onEdit={() => setIsDialogOpen(true)} />
      <PersonDetailsBreadcrumb />
      <PersonEditDialog
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
      />
    </div>
  );
}

export default PersonDetails;