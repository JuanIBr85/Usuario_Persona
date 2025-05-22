import { Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Profile />} />
      <Route path="/adminpanel" element={<AdminPanel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

