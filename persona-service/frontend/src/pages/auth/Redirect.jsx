import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '@/components/loading/Loading';
import { useAuthContext } from '@/context/AuthContext';
import { componentService } from '@/services/componentService';


const Redirect = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { authData } = useAuthContext();

    useEffect(() => {
        const code = searchParams.get('code');

        componentService.get_redirect(code).then((response) => {
            sessionStorage.setItem('_redirect', response.data);

        }).finally(() => {
            navigate('/auth/login');
        });
    }, []);

    return (
        <div>
            <Loading></Loading>
        </div>
    );
};

export default Redirect;