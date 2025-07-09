import { Routes, Route } from "react-router-dom";

import React from "react";
import Profile from "@/pages/user/Profile";
import AdminPanel from "@/pages/admin/AdminPanel";
import NotFound from "@/pages/other/NotFound";
import Login from "@/pages/auth/Login";
import Logout from "@/pages/auth/Logout";
import Sign from "@/pages/auth/Sign";
import Logs from "@/pages/admin/Logs";
import AdminPersons from "@/pages/admin/AdminPersons";
import AdminRoles from "@/pages/admin/AdminRoles";
import PersonDetails from "@/pages/admin/PersonDetails";
import TermsOfService from "@/pages/user/TermsOfService";
import AboutPrivacyPolicy from "@/pages/user/AboutPrivacyPolicy";
import Faq from "@/pages/user/Faq";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import OTPValidation from "@/pages/auth/OTPValidation";
import OTPRegister from "@/pages/auth/OTPRegister";
import ResetPassword from "@/pages/auth/ResetPassword";
import PerfilConnect from "@/pages/user/PerfilConnect";
import AdminServices from "@/pages/admin/AdminServices";
import ComponentServices from "@/pages/component/ComponentServices";
import ComponentServicesDetails from "@/pages/component/ComponentServicesDetails";
import Redirect from "@/pages/auth/Redirect";
import EndpointsResearch from "@/pages/endpoints/EndpointsResearch";
import CreatePerfil from "@/pages/user/CreatePerfil";
import OTPRegisterRecovery from "@/pages/auth/OTPRegisterRecovery";
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
      <Route path="createperfil" element={<CreatePerfil />} />
      <Route path="perfilconnect" element={<PerfilConnect />} />
      <Route path="adminpanel" element={<AdminPanel />} />
      <Route path="logs" element={<Logs />} />
      <Route path="adminpersons" element={<AdminPersons />} />
      <Route path="adminservices" element={<AdminServices />} />
      <Route path="adminroles" element={<AdminRoles />} />
      <Route path="adminservices/components" element={<ComponentServices />} />
      <Route path="adminservices/components/:id" element={<ComponentServicesDetails />} />

      <Route path="adminservices/endpoints-research/" element={<EndpointsResearch />} />

      <Route path="persondetails/:id" element={<PersonDetails />} />
      <Route path="faq/privacypolicy" element={<AboutPrivacyPolicy />} />
      <Route path="faq/termsofservice" element={<TermsOfService />} />
      <Route path="faq/faq" element={<Faq />} />
      <Route path="*" element={<NotFound />} />

      <Route path="auth/forgotpassword" element={<ForgotPassword />} />
      <Route path="auth/resetpassword" element={<ResetPassword />} />
      <Route path="auth/login" element={<Login />} />
      <Route path="auth/sign" element={<Sign />} />
      <Route path="auth/logout" element={<Logout />} />
      <Route path="auth/otpvalidation" element={<OTPValidation />} />
      <Route path="auth/redirect" element={<Redirect />} />
      <Route path="auth/otpregister" element={<OTPRegister />} />
      <Route path="auth/otpregisterrecovery" element={<OTPRegisterRecovery />} />
    </Routes>
  );
}

export default AppRoutes;
