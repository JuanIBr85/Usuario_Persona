import { Routes, Route } from 'react-router-dom';

import React from 'react'
import Profile from '@/pages/user/Profile';
import AdminPanel from '@/pages/admin/AdminPanel';
import NotFound from '@/pages/other/NotFound';
import Login from '@/pages/auth/Login';
import Logout from '@/pages/auth/Logout';
import Sign from '@/pages/auth/Sign';
import Logs from '@/pages/admin/Logs';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminRoles from '@/pages/admin/AdminRoles';
import UserDetails from '@/pages/admin/UserDetails';
import TermsOfService from '@/pages/user/TermsOfService';
import AboutPrivacyPolicy from '@/pages/user/AboutPrivacyPolicy';
import Faq from '@/pages/user/Faq';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import OTPValidation from '@/pages/auth/OTPValidation';

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
      <Route path="sign" element={<Sign />} />
      <Route path="logout" element={<Logout />} />
      <Route path="otpvalidation" element={<OTPValidation />} />
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