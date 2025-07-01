import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';

import SpinnerFallback from './components/SpinnerFallback';
import AccessibilityWidget from './components/AccessibilityWidget';

import GestionAreasConocimiento from './pages/GestionAreaConocimiento';
import GestionTipoPropuesta from './pages/GestionTipoPropuesta';
import GestionCertificacion from './pages/GestionCertificacion';
import GestionArchivos from './pages/GestionArchivo';
import GestionInstituciones from './pages/GestionInstitucion';
import GestionHistorial from './pages/GestionHistorial';
import GestionConvenio from './pages/GestionConvenio';
import GestionPropuestaEducativa from "./pages/GestionPropuestaEducativa";
import GestionPreinscripcion from "./pages/GestionPreinscripcion";
import GestionEgresados from "./pages/GestionEgresados";
import GestionCoordinador from "./pages/GestionCoordinador";
import GestionSedeCreus from "./pages/GestionSedeCreus";
import GestionCohortes from "./pages/GestionCohortes";
import GestionHistorialNavegacion from "./pages/GestionHistorialNavegacion";

const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              <Suspense fallback={<SpinnerFallback />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/gestion-certificacion" element={<GestionCertificacion />} />
                  <Route path="/gestion-propuesta-educativa" element={<GestionPropuestaEducativa />} />
                  <Route path="/gestion-tipo-propuesta" element={<GestionTipoPropuesta />} />
                  <Route path="/gestion-area-conocimiento" element={<GestionAreasConocimiento />} />
                  <Route path="/gestion-certificacion" element={<GestionCertificacion />} />
                  <Route path="/gestion-cohorte" element={<GestionCohortes />} />
                  <Route path="/gestion-preinscripcion" element={<GestionPreinscripcion />} />
                  <Route path="/gestion-egresado" element={<GestionEgresados />} />
                  <Route path="/gestion-coordinador" element={<GestionCoordinador />} />
                  <Route path="/gestion-sede" element={<GestionSedeCreus />} />
                  <Route path="/gestion-institucion" element={<GestionInstituciones />} />
                  <Route path="/gestion-convenio" element={<GestionConvenio />} />
                  <Route path="/gestion-archivo" element={<GestionArchivos />} />
                  <Route path="/gestion-historial" element={<GestionHistorial />} />
                  <Route path="/gestion-historial-navegacion" element={<GestionHistorialNavegacion />} />
                </Routes>
              </Suspense>
            </main>
            <AccessibilityWidget />
          </div>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;