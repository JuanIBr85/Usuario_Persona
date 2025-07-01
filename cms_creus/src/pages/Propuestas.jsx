import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Award,
  FileText,
  ArrowLeft,
  Star,
  Target,
  Zap,
  Heart,
  Wrench,
  Search,
  Filter,
} from "lucide-react";
import Header from '../components/Header'
import Footer from '../components/Footer'
import AccessibilityMenu from '../components/AccessibilityMenu'

const todasLasPropuestas = [
  {
    id: "programacion",
    name: "Tecnicatura en Programación",
    icon: Target,
    color: "from-blue-500 to-blue-600",
    image: "https://cdn.euroinnova.edu.es/img/subidasEditor/code-1839406_640-1611692303.webp",
    area: "Tecnología",
    inscripcionesAbiertas: true,
    duracion: "3 años",
    modalidad: "Presencial",
    descripcionCorta: "Formación integral en desarrollo de software, redes y sistemas informáticos.",
  },
  {
    id: "enfermeria",
    name: "Tecnicatura en Enfermería",
    icon: Award,
    color: "from-blue-400 to-blue-500",
    image: "https://back.sise.edu.pe/uploads/8_razones_estudiar_enfermeria_beneficios_1a6a185775.jpg",
    area: "Salud",
    inscripcionesAbiertas: true,
    duracion: "3 años",
    modalidad: "Presencial",
    descripcionCorta: "Capacitación integral en cuidados de enfermería y atención sanitaria.",
  },
  {
    id: "prueba1",
    name: "Prueba",
    icon: Zap,
    color: "from-slate-400 to-slate-500",
    image: "/placeholder.svg?height=200&width=300&text=Electrónica",
    area: "Prueba",
    inscripcionesAbiertas: false,
    duracion: "Sin duración",
    modalidad: "Sin modalidad",
    descripcionCorta: "Prueba para ver la página con muchas propuestas cargadas",
  },
  // Agregá las demás pruebas igual que en tu código original...
];

const areas = ["Todas", "Tecnología", "Salud", "Servicios", "Gestión", "Construcción"];

export default function PropuestasPage() {
  const [filtroArea, setFiltroArea] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");

  const propuestasFiltradas = todasLasPropuestas.filter((propuesta) => {
    const coincideArea = filtroArea === "Todas" || propuesta.area === filtroArea;
    const coincideBusqueda = propuesta.name.toLowerCase().includes(busqueda.toLowerCase());
    return coincideArea && coincideBusqueda;
  });

  return (
    <div className="min-h-screen font-switzer bg-gradient-to-br from-slate-300 via-blue-200 to-slate-400 pt-20">
      <Header />
      <AccessibilityMenu />

      <div className="bg-blue-100/70 backdrop-blur-sm border-b border-blue-200/60 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="mr-4">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Propuesta académica</h1>
          <p className="text-lg text-slate-700">
            Descubrí toda nuestra propuesta académica: desde carreras de grado hasta charlas.
          </p>
        </div>
      </div>

      <div className="bg-slate-200/70 backdrop-blur-sm border-b border-slate-300/60 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar propuesta..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600 font-medium">Área:</span>
              <div className="flex space-x-1">
                {areas.map((area) => (
                  <button
                    key={area}
                    onClick={() => setFiltroArea(area)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      filtroArea === area
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propuestasFiltradas.map((propuesta, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg bg-slate-100/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 border border-slate-400/60 hover:border-slate-500 shadow-md hover:shadow-lg"
              >
                {propuesta.inscripcionesAbiertas && (
                  <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    INSCRIPCIONES ABIERTAS
                  </div>
                )}

                <div className="relative h-48 overflow-hidden">
                  <img
                    src={propuesta.image || "/placeholder.svg"}
                    alt={propuesta.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                  <div className="absolute bottom-4 right-4">
                    <div
                      className={`bg-gradient-to-br ${propuesta.color} w-10 h-10 rounded-lg flex items-center justify-center shadow-lg`}
                    >
                      <propuesta.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">{propuesta.area}</span>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>{propuesta.duracion}</span>
                      <span>•</span>
                      <span>{propuesta.modalidad}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-800">{propuesta.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{propuesta.descripcionCorta}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-500 text-slate-700 hover:bg-slate-200"
                      asChild
                    >
                      <Link to={`/propuesta/${propuesta.id}`}>
                        <FileText className="w-4 h-4 mr-1" />
                        Más información
                      </Link>
                    </Button>
                </div>
              </div>
            ))}
          </div>

          {propuestasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg p-8 border border-slate-300/60">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No se encontraron propuestas</h3>
                <p className="text-slate-600">
                  Intenta ajustar los filtros o la búsqueda para encontrar la propuesta que buscas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
