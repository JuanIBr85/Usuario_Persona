import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/loading/Loading';
import { useAuthContext } from '@/context/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const {removeAuthData} = useAuthContext();

  useEffect(() => {
    removeAuthData();
    sessionStorage.clear();
    navigate('/login');
  }, [navigate]);

  return (
    <div>
      <Loading></Loading>
    </div>
  );
};

export default Logout;