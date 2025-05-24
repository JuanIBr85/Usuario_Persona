import { Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Sign from './pages/Sign';
import { PruebaChart } from './pages/PruebaChart';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign" element={<Sign />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/prueba" element={<PruebaChart />} />

      </Routes>
    </Layout>

  );
}

export default App;

