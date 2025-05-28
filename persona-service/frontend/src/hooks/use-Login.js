import { useState } from 'react';
import api from "@/services/api"; // Ajusta la ruta según la estructura de tu proyecto

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // Guarda el usuario
  const [message, setMessage] = useState(null); // Guarda el mensaje de éxito si lo quieres mostrar

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await api.login(email, password);

      // Guarda el token en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Guarda el usuario en el estado
      setUser(data.usuario);

      // Guarda el mensaje opcionalmente
      setMessage(data.mensaje);

      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, user, message };
}