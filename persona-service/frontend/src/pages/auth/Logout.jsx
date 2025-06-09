import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/loading/Loading';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
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