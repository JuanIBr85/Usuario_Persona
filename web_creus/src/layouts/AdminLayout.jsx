import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Home,
  Library,
  BookOpenCheck,
  Layers,
  ScrollText,
  Award,
  Users,
  ClipboardList,
  GraduationCap,
  UserCog,
  CalendarRange,
  Landmark,
  Handshake,
  FileArchive,
  Terminal,
  History,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  //secciones con menus y submenus
  const navigation = [
    { label: "Inicio", to: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      label: "Propuestas Educativas",
      icon: <Library className="w-5 h-5" />,
      children: [
        {
          label: "Propuestas",
          to: "/gestion-propuesta-educativa",
          icon: <BookOpenCheck className="w-4 h-4" />,
        },
        {
          label: "Tipos de Propuesta",
          to: "/gestion-tipo-propuesta",
          icon: <ScrollText className="w-4 h-4" />,
        },
        {
          label: "Áreas de Conocimiento",
          to: "/gestion-area-conocimiento",
          icon: <Layers className="w-4 h-4" />,
        },
        {
          label: "Títulos de Certificación",
          to: "/gestion-certificacion",
          icon: <Award className="w-4 h-4" />,
        },
        {
          label: "Cohortes",
          to: "/gestion-cohorte",
          icon: <CalendarRange className="w-4 h-4" />,
        },
      ],
    },
    {
      label: "Personas",
      icon: <Users className="w-5 h-5" />,
      children: [
        {
          label: "Preinscripciones",
          to: "/gestion-preinscripcion",
          icon: <ClipboardList className="w-4 h-4" />,
        },
        {
          label: "Egresados",
          to: "/gestion-egresado",
          icon: <GraduationCap className="w-4 h-4" />,
        },
        {
          label: "Coordinadores",
          to: "/gestion-coordinador",
          icon: <UserCog className="w-4 h-4" />,
        },
      ],
    },
    {
      label: "Institucional",
      icon: <Landmark className="w-5 h-5" />,
      children: [
        {
          label: "Instituciones",
          to: "/gestion-institucion",
          icon: <MapPin className="w-4 h-4" />,
        },
        {
          label: "Sedes CREUS",
          to: "/gestion-sede",
          icon: <Home className="w-4 h-4" />,
        },
        {
          label: "Convenios",
          to: "/gestion-convenio",
          icon: <Handshake className="w-4 h-4" />,
        },
      ],
    },
    {
      label: "Sistema",
      icon: <SlidersHorizontal className="w-5 h-5" />,
      children: [
        {
          label: "Archivos",
          to: "/gestion-archivo",
          icon: <FileArchive className="w-4 h-4" />,
        },
        {
          label: "Historial de Acciones",
          to: "/gestion-historial",
          icon: <Terminal className="w-4 h-4" />,
        },
        {
          label: "Historial de Navegación",
          to: "/gestion-historial-navegacion",
          icon: <History className="w-4 h-4" />,
        },
      ],
    },
  ];

  // Sidebar expandido si está abierto o si está colapsado pero el mouse está encima
  const isSidebarExpanded = !collapsed || sidebarHovered;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar móvil */}
      <div
        className={`fixed inset-0 z-40 transition-transform transform ${
          sidebarOpenMobile ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div
          className="absolute inset-0 bg-black opacity-40"
          onClick={() => setSidebarOpenMobile(false)}
        ></div>
        <div className="relative z-50 w-64 bg-white shadow-lg h-full p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">ADMINISTRACIÓN</h2>
            <button onClick={() => setSidebarOpenMobile(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <SidebarContent
            navigation={navigation}
            navigate={navigate}
            location={location}
            collapsed={false}
          />
          <div className="mt-auto pt-6">
            <button
              onClick={() => {
                setSidebarOpenMobile(false);
                navigate("/");
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors group"
            >
              <Home className="w-5 h-5" />
              <span>Ir al sitio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layout principal en escritorio */}
      <div className="hidden md:flex h-screen">
        {/* Sidebar escritorio */}
        <aside
          className={`flex flex-col ${isSidebarExpanded ? "w-64" : "w-20"} bg-white border-r shadow-sm h-full z-20 transition-all duration-300`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          style={{ zIndex: 30 }}
        >
          <div
            className={`flex items-center justify-between p-4 border-b ${isSidebarExpanded ? "" : "justify-center"}`}
          >
            {isSidebarExpanded && (
              <h2 className="text-lg font-bold text-gray-800">
                ADMINISTRACIÓN
              </h2>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <SidebarContent
              navigation={navigation}
              navigate={navigate}
              location={location}
              collapsed={!isSidebarExpanded}
            />
          </div>
          <div className="p-4">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors group"
            >
              <Home className="w-5 h-5" />
              {isSidebarExpanded && <span>Ir al sitio</span>}
            </button>
          </div>
        </aside>
        {/* Contenido principal */}
        <main className="flex-1 w-full h-full overflow-y-auto p-6 transition-all duration-300">
          {/* Botón hamburguesa en móvil */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setSidebarOpenMobile(true)}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          {children}
        </main>
      </div>

      {/* Contenido principal en móvil */}
      <div className="md:hidden">
        <main
          className={`w-full h-screen overflow-y-auto p-6 transition-all duration-300 ${
            sidebarOpenMobile
              ? "pointer-events-none blur-sm opacity-60 select-none"
              : ""
          }`}
        >
          {/* Botón hamburguesa en móvil */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setSidebarOpenMobile(true)}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

// sidebar con los submenus
const SidebarContent = ({ navigation, navigate, location, collapsed }) => (
  <nav className="space-y-2">
    {navigation.map((item) =>
      item.children ? (
        <SidebarGroup
          key={item.label}
          item={item}
          location={location}
          collapsed={collapsed}
          navigate={navigate}
        />
      ) : (
        <Link
          key={item.label}
          to={item.to}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
            location.pathname === item.to
              ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
          }`}
          title={collapsed ? item.label : ""}
          onClick={() => window.innerWidth < 768 && navigate(item.to)}
        >
          <span className="flex-shrink-0 transition-transform group-hover:scale-110">
            {item.icon}
          </span>
          {!collapsed && (
            <span className="transition-all duration-200 group-hover:translate-x-1">
              {item.label}
            </span>
          )}
        </Link>
      ),
    )}
  </nav>
);

const SidebarGroup = ({ item, location, collapsed, navigate }) => {
  const [open, setOpen] = useState(false);

  // se abre el grupo si algun item de ese grupo está activo
  useEffect(() => {
    if (item.children.some((child) => location.pathname === child.to)) {
      setOpen(true);
    }
  }, [location.pathname, item.children]);

  return (
    <div>
      <button
        type="button"
        className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          open
            ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
        }`}
        onClick={() => setOpen((v) => !v)}
        title={collapsed ? item.label : ""}
      >
        <span className="flex-shrink-0 transition-transform group-hover:scale-110">
          {item.icon}
        </span>
        {!collapsed && (
          <span className="flex-1 text-left transition-all duration-200 group-hover:translate-x-1">
            {item.label}
          </span>
        )}
        {!collapsed && (
          <svg
            className={`w-4 h-4 ml-auto transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </button>
      {open && !collapsed && (
        <ul className="ml-6 mt-2 flex flex-col gap-3">
          {item.children.map((child) => (
            <li key={child.label}>
              <Link
                to={child.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 text-sm group ${
                  location.pathname === child.to
                    ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                }`}
                onClick={() => window.innerWidth < 768 && navigate(child.to)}
                title={child.label}
              >
                <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                  {child.icon}
                </span>
                <span className="transition-all duration-200 group-hover:translate-x-1">
                  {child.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminLayout;
