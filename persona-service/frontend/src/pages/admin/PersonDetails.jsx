import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loading from "@/components/loading/Loading";

import { PersonaService } from "@/services/personaService";

import PersonDetailsCard from "@/components/person-details/PersonDetailsCard";
import PersonEditDialog from "@/components/person-details/PersonEditDialog";
import PersonDetailsBreadcrumb from "@/components/person-details/PersonDetailsBreadcrumb";

function PersonDetails() {
  const { id } = useParams();

  const [person, setPerson] = useState(null);
  const [editingPerson, setEditingPerson] = useState(null);
  const [redesSociales, setRedesSociales] = useState([]);
  const [tiposDocumentos, setTiposDocumentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  useEffect(() => {
    PersonaService.get_by_id(id)
      .then((res) => {
        if (res?.data) {
          const persona = res.data;
          const personMapped = {
            id: persona.id_persona,
            usuario_id: persona.usuario_id || null,
            nombre: persona.nombre_persona || "",
            apellido: persona.apellido_persona || "",
            tipo_documento: persona.tipo_documento || "Tipo de documento indefinido",
            documento: persona.num_doc_persona || "",
            fecha_nacimiento: persona.fecha_nacimiento_persona || "",
            fechaRegistro: new Date(persona.created_at).toLocaleDateString(),
            fechaActualizacion: new Date(persona.updated_at).toLocaleDateString(),
            eliminado: persona.deleted_at !== null,
            email: persona.contacto?.email_contacto || "Sin email",
            telefono_movil: persona.contacto?.telefono_movil || "Sin móvil",
            telefono_fijo: persona.contacto?.telefono_fijo || "Sin fijo",
            red_social_nombre: persona.contacto?.red_social_nombre || "Sin red social",
            red_social_contacto: persona.contacto?.red_social_contacto || "Sin nombre de usuario en red",
            observacion_contacto: persona.contacto?.observacion_contacto || "",
            calle: persona.domicilio?.domicilio_calle || "Sin dirección",
            numero: persona.domicilio?.domicilio_numero || "",
            piso: persona.domicilio?.domicilio_piso || "",
            dpto: persona.domicilio?.domicilio_dpto || "",
            referencia: persona.domicilio?.domicilio_referencia || "",
            codigo_postal: persona.domicilio?.domicilio_postal?.codigo_postal || "",
            localidad: persona.domicilio?.domicilio_postal?.localidad || "",
            partido: persona.domicilio?.domicilio_postal?.partido || "",
            provincia: persona.domicilio?.domicilio_postal?.provincia || "",
            domicilio_id: persona.domicilio?.id_domicilio || null,
            domicilio_cp_id: persona.domicilio?.codigo_postal_id || null,
          };
          setPerson(personMapped);
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
      setTiposDocumentos(res?.data || []);
    });
  }, []);

  useEffect(() => {
    if (editingPerson?.codigo_postal?.length >= 4) {
      PersonaService.get_localidades_by_codigo_postal(editingPerson.codigo_postal)
        .then((res) => {
          setLocalidades(res?.data || []);
        });
    }
  }, [editingPerson?.codigo_postal]);

  const handleEditSubmit = async (body) => {
    setPerson(editingPerson);
    setEditingPerson(null);
    PersonaService.editar(id, body);
  };

  if (!person) {
    return <Loading />;
  }

  return (
    <div className="p-6 space-y-6">
      <PersonDetailsCard person={person} onEdit={() => setEditingPerson({ ...person })} />
      <PersonDetailsBreadcrumb />
      <PersonEditDialog
        open={!!editingPerson}
        editingPerson={editingPerson}
        setEditingPerson={setEditingPerson}
        onSubmit={handleEditSubmit}
        redesSociales={redesSociales}
        tiposDocumentos={tiposDocumentos}
        localidades={localidades}
      />
    </div>
  );
}

export default PersonDetails;