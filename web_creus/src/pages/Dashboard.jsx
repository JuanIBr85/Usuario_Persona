import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout";
import {
  Library,
  BookOpenCheck,
  Layers,
  Award,
  Home,
  Users,
  ScrollText,
  GraduationCap,
  CalendarRange,
  UserCog,
  Landmark,
  MapPin,
  University,
  Handshake,
  FileArchive,
  Terminal,
  History,
  ChevronRight,
  User,
  ClipboardList,
  SlidersHorizontal,
} from "lucide-react";

//secciones del dashboard
const dashboardSections = [
  {
    id: "propuestas",
    color: "blue",
    title: "Propuestas Educativas",
    description:
      "Gestión de la oferta académica: propuestas, títulos y cohortes.",
    icon: <Library className="w-7 h-7 text-blue-500" />,
    items: [
      {
        to: "/gestion-propuesta-educativa",
        label: "Propuestas",
        icon: <BookOpenCheck className="w-5 h-5 text-blue-400" />,
      },
      {
        to: "/gestion-tipo-propuesta",
        label: "Tipos de Propuesta",
        icon: <ScrollText className="w-5 h-5 text-blue-400" />,
      },
      {
        to: "/gestion-area-conocimiento",
        label: "Áreas de Conocimiento",
        icon: <Layers className="w-5 h-5 text-blue-400" />,
      },
      {
        to: "/gestion-certificacion",
        label: "Títulos de Certificación",
        icon: <Award className="w-5 h-5 text-blue-400" />,
      },
      {
        to: "/gestion-cohorte",
        label: "Cohortes",
        icon: <CalendarRange className="w-5 h-5 text-blue-400" />,
      },
    ],
  },
  {
    id: "personas",
    color: "emerald",
    title: "Personas",
    description:
      "Gestión de personas vinculadas: preinscriptos, egresados y coordinadores",
    icon: <Users className="w-7 h-7 text-emerald-500" />,
    items: [
      {
        to: "/gestion-preinscripcion",
        label: "Preinscripciones",
        icon: <ClipboardList className="w-5 h-5 text-emerald-400" />,
      },
      {
        to: "/gestion-egresado",
        label: "Egresados",
        icon: <GraduationCap className="w-5 h-5 text-emerald-400" />,
      },
      {
        to: "/gestion-coordinador",
        label: "Coordinadores",
        icon: <UserCog className="w-5 h-5 text-emerald-400" />,
      },
    ],
  },
  {
    id: "instituciones",
    color: "violet",
    title: "Institucional",
    description:
      "Gestión de la red institucional: sedes, convenios y organizaciones asociadas.",
    icon: <Landmark className="w-7 h-7 text-violet-500" />,
    items: [
      {
        to: "/gestion-institucion",
        label: "Instituciones",
        icon: <MapPin className="w-5 h-5 text-violet-400" />,
      },
      {
        to: "/gestion-sede",
        label: "Sedes CREUS",
        icon: <Home className="w-5 h-5 text-violet-400" />,
      },
      {
        to: "/gestion-convenio",
        label: "Convenios",
        icon: <Handshake className="w-5 h-5 text-violet-400" />,
      },
    ],
  },
  {
    id: "sistema",
    color: "orange",
    title: "Sistema",
    description:
      "Gestión técnica y documental del sistema: archivos e historiales de acciones y de navegación.",
    icon: <SlidersHorizontal className="w-7 h-7 text-orange-500" />,
    items: [
      {
        to: "/gestion-archivo",
        label: "Archivos",
        icon: <FileArchive className="w-5 h-5 text-orange-400" />,
      },
      {
        to: "/gestion-historial",
        label: "Historial de Acciones",
        icon: <Terminal className="w-5 h-5 text-orange-400" />,
      },
      {
        to: "/gestion-historial-navegacion",
        label: "Historial de Navegación",
        icon: <History className="w-5 h-5 text-orange-400" />,
      },
    ],
  },
];

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth(); //para ver si el usuario esta auntetnicado
  const [search, setSearch] = useState("");

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // buscar
  const filteredSections = dashboardSections
    .map((section) => {
      const matchSection = section.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const filteredItems = section.items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      );
      if (matchSection || filteredItems.length > 0 || search === "") {
        return {
          ...section,
          items: matchSection ? section.items : filteredItems,
        };
      }
      return null;
    })
    .filter(Boolean);

  //saludo inicial
  return (
    <AdminLayout>
      <div className="pt-6 px-6 pb-6 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow flex flex-col sm:flex-row items-center gap-4 p-6 mb-6">
          <div className="p-3 bg-blue-50 rounded-full">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Hola, {user.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              Desde aquí podés gestionar toda la información institucional del
              CREUS
            </p>
          </div>
        </div>

        {/* titulo y buscador */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              Dashboard Administrativo
            </h2>
            <p className="text-gray-600">
              Seleccioná una sección para comenzar
            </p>
          </div>
          <div className="w-full sm:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar sección o ítem..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  title="Limpiar búsqueda"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* en desarrollo (desp sacar) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-full">
            <Terminal className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">En desarrollo</h3>
            <p className="text-sm text-gray-600">
              Cohortes e Historial de navegación están siendo desarrollados
            </p>
          </div>
        </div>

        {/* Grid de secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSections.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              <p>No se encontraron secciones ni ítems para "{search}"</p>
            </div>
          ) : (
            filteredSections.map((section) => (
              <DashboardSection key={section.id} section={section} />
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

//dashboard
const DashboardSection = ({ section }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
    {/* Header de la sección */}
    <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-5">
      <div className="p-2 bg-gray-100 rounded-lg flex items-center justify-center">
        {section.icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
      </div>
    </div>
    {/* Lista de elementos */}
    <div className="flex-1 px-6 py-4">
      <div className="space-y-2">
        {section.items.length === 0 ? (
          <div className="text-gray-400 italic text-sm">Sin ítems</div>
        ) : (
          section.items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm transition-all duration-200 group"
            >
              <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              <span className="transition-all duration-200 group-hover:translate-x-1">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            </Link>
          ))
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;
