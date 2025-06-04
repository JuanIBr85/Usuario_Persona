import { Routes, Route } from 'react-router-dom';

import React from 'react'
import Profile from '@/pages/Profile';
import AdminPanel from '@/pages/AdminPanel';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import Logout from '@/pages/Logout';
import Sign from '@/pages/Sign';
import Logs from '@/pages/Logs';
import AdminUsers from '@/pages/AdminUsers';
import AdminRoles from '@/pages/AdminRoles';
import UserDetails from '@/pages/UserDetails';
import TermsOfService from '@/pages/TermsOfService';
import AboutPrivacyPolicy from '@/pages/AboutPrivacyPolicy';
import Faq from '@/pages/Faq';
import ForgotPassword from '@/pages/ForgotPassword';

/**
 * Componente que define todas las rutas de la aplicación utilizando react-router-dom.
 * Cada ruta se asocia con un componente de página específico para renderizar.
 *
 * @returns {JSX.Element} Conjunto de rutas para la navegación del sitio.
 */

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminPanel />} />
      <Route path="profile" element={<Profile />} />
      <Route path="adminpanel" element={<AdminPanel />} />
      <Route path="login" element={<Login />} />
      <Route path="login/termsofservice" element={<TermsOfService />} />
      <Route path="login/privacypolicy" element={<AboutPrivacyPolicy />} />
      <Route path="sign" element={<Sign />} />
      <Route path="sign/termsofservice" element={<TermsOfService />} />
      <Route path="sign/privacypolicy" element={<AboutPrivacyPolicy />} />
      <Route path="logout" element={<Logout />} />
      <Route path="logs" element={<Logs />} />
      <Route path="adminusers" element={<AdminUsers />} />
      <Route path="adminroles" element={<AdminRoles />} />
      <Route path="userdetails/:id" element={<UserDetails />} />
      <Route path="privacypolicy" element={<AboutPrivacyPolicy />} />
      <Route path="termsofservice" element={<TermsOfService />} />
      <Route path="faq" element={<Faq />} />
      <Route path="*" element={<NotFound />} />
      <Route path="forgotpassword" element={<ForgotPassword />} />
    </Routes>
  )
}

export default AppRoutes