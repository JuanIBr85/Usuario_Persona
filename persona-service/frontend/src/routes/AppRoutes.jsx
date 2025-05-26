import { Routes, Route } from 'react-router-dom';
import React from 'react';

import Layout from '../components/Layout';

import Profile from '../pages/Profile';
import AdminPanel from '../pages/AdminPanel';
import NotFound from '../pages/NotFound';
import Login from '../pages/Login';
import Sign from '../pages/Sign';
import Logs from '../pages/Logs';
import AdminUsers from '../pages/AdminUsers';
import AdminRoles from '../pages/AdminRoles';

import { PruebaChart } from '../pages/PruebaChart';

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas sin layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/sign" element={<Sign />} />

      {/* Rutas con layout */}
      <Route element={<Layout />}>
        <Route index element={<AdminPanel />} /> {/* pd: esto es la raíz "/" */}
        <Route path="profile" element={<Profile />} />
        <Route path="adminpanel" element={<AdminPanel />} />
        <Route path="logs" element={<Logs />} />
        <Route path="adminusers" element={<AdminUsers />} />
        <Route path="adminroles" element={<AdminRoles />} />
        <Route path="prueba" element={<PruebaChart />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
