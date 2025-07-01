import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/loading/Loading';
import { useAuthContext } from '@/context/AuthContext';

/**
 * Logout.jsx
 *
 * Este componente se encarga de cerrar la sesión del usuario.
 * Al montarse, elimina los datos de autenticación, limpia el `sessionStorage`
 * y redirige al usuario a la página de login.
 *
 * Flujo:
 * - Elimina los datos de sesión localmente (contexto + sessionStorage).
 * - Redirige a `/auth/login`.
 * - Muestra un spinner de carga brevemente mientras se realiza la operación.
 *
 */
const Logout = () => {
  const navigate = useNavigate();                  // Hook para navegación programática
  const { removeAuthData } = useAuthContext();     // Función del contexto para eliminar los datos de auth

  useEffect(() => {
    removeAuthData();           // Limpia los datos del contexto de autenticación
    sessionStorage.clear();     // Borra cualquier dato guardado en sessionStorage
    navigate('/auth/login');   // Redirige a la pantalla de login
  }, [navigate]);

  return (
    <div>
      {/* Muestra una pantalla de carga mientras se realiza el logout */}
      <Loading></Loading>
    </div>
  );
};

export default Logout;