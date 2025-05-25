import { Routes, Route } from 'react-router-dom';

import React from 'react'
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
        <Route path="/profile" element={<Profile />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
        <Route path="/" element={<AdminPanel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign" element={<Sign />} />
        <Route path="*" element={<NotFound />} />
        <Route path="logs" element={<Logs />} />
        <Route path="adminusers" element={<AdminUsers />} />
        <Route path="adminroles" element={<AdminRoles />} />
        <Route path="/prueba" element={<PruebaChart />} />
      </Routes>
  )
}

export default AppRoutes