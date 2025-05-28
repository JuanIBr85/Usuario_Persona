import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api"; // Asegúrate de la ruta correcta

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const register = async (nombre, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.register(nombre, email, password);
      alert(response.mensaje);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}