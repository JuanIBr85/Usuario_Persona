import { Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound'; 
import Login from './pages/Login';
import Sign from './pages/Sign';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Profile />} />
      <Route path="/adminpanel" element={<AdminPanel />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign" element={<Sign />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

