import React, { useState, useEffect } from "react";
import { componentService } from "@/services/componentService";
import { useNavigate, useParams } from "react-router-dom";

function ComponentTable() {
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await componentService.get_by_id(id); 
        setDetails(data);
      } catch (error) {
        console.error("Error fetching component details:", error);
      }
    };

    fetchDetails();
  }, [id]); 

  console.log(details);

  return (
    <div>
      {details ? (
        <div>
          <h1>Detalles del Componente</h1>
          <pre>{JSON.stringify(details, null, 2)}</pre>
        </div>
      ) : (
        <p>Cargando detalles...</p>
      )}
    </div>
  );
}

export default ComponentTable;
