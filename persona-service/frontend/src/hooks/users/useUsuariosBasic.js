import { useState, useEffect } from "react";
import { userService } from "@/services/userService";

export function useUsuariosBasic() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsuarios() {
      setLoading(true);
      setError("");
      try {
        const userData = await userService.getAllUsers();
        const basicUsers = Array.isArray(userData)
          ? userData.map(u => ({
              id: u.id,
              nombre_usuario: u.nombre_usuario,
              email_usuario: u.email_usuario,
            }))
          : [];
        setUsuarios(basicUsers);
      } catch (e) {
        setError("Error al obtener usuarios");
        setUsuarios([]);
      }
      setLoading(false);
    }
    fetchUsuarios();
  }, []);

  return { usuarios, loading, error };
}