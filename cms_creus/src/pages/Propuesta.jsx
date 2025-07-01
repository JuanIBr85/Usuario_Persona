import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import {
  BookOpen,
  Award,
  FileText,
  UserPlus,
  MessageCircle,
  ArrowLeft,
  Star,
  Target,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  User,
  Briefcase,
} from "lucide-react";
import Header from '../components/Header'
import Footer from '../components/Footer'
import AccessibilityMenu from '../components/AccessibilityMenu'

const propuestasData = {
  programacion: {
    id: "programacion",
    name: "Técnicatura en Programación",
    icon: Target,
    color: "from-blue-500 to-blue-600",
    image: "https://cdn.euroinnova.edu.es/img/subidasEditor/code-1839406_640-1611692303.webp",
    area: "Tecnología",
    inscripcionesAbiertas: true,
    duracion: "3 años",
    modalidad: "Presencial",
    descripcion:
      "La carrera de Técnico en Informática forma profesionales capacitados para desarrollar, implementar y mantener sistemas informáticos. Los estudiantes adquieren conocimientos sólidos en programación, bases de datos, redes y sistemas operativos.",
    objetivos: [
      "Desarrollar aplicaciones de software utilizando diferentes lenguajes de programación",
      "Administrar bases de datos y sistemas de información",
      "Configurar y mantener redes informáticas",
      "Brindar soporte técnico a usuarios y equipos",
      "Implementar medidas de seguridad informática",
    ],
    materias: [
      "Fundamentos de Programación",
      "Bases de Datos",
      "Redes y Comunicaciones",
      "Sistemas Operativos",
      "Desarrollo Web",
      "Seguridad Informática",
      "Análisis de Sistemas",
      "Programación Orientada a Objetos",
    ],
    salidaLaboral: [
      "Desarrollador de software",
      "Administrador de bases de datos",
      "Técnico en redes",
      "Soporte técnico",
      "Analista de sistemas junior",
    ],
    requisitos: ["DNI argentino", "Título secundario"],
  },
  enfermeria: {
    id: "enfermeria",
    name: "Tecnicatura en Enfermería",
    icon: Award,
    color: "from-blue-400 to-blue-500",
    image: "https://back.sise.edu.pe/uploads/8_razones_estudiar_enfermeria_beneficios_1a6a185775.jpg",
    area: "Salud",
    inscripcionesAbiertas: true,
    duracion: "3 años",
    modalidad: "Presencial",
    descripcion:
      "La carrera de Técnico en Enfermería prepara profesionales para brindar cuidados de enfermería de calidad, trabajando en equipo con otros profesionales de la salud para promover, mantener y restaurar la salud de las personas.",
    objetivos: [
      "Brindar cuidados de enfermería integrales y de calidad",
      "Aplicar técnicas y procedimientos de enfermería",
      "Participar en programas de promoción y prevención de la salud",
      "Colaborar en el tratamiento y rehabilitación de pacientes",
      "Mantener registros de enfermería precisos y actualizados",
    ],
    materias: [
      "Anatomía y Fisiología",
      "Fundamentos de Enfermería",
      "Farmacología",
      "Enfermería Médico-Quirúrgica",
      "Enfermería Materno-Infantil",
      "Enfermería en Salud Mental",
      "Primeros Auxilios",
      "Ética y Legislación en Salud",
    ],
    salidaLaboral: [
      "Técnico en enfermería hospitalaria",
      "Enfermero en centros de salud",
      "Cuidados domiciliarios",
      "Enfermería geriátrica",
      "Asistente en consultorios médicos",
    ],
    requisitos: ["DNI argentino", "Título secundario", "Certificado de salud"],
  },
};

export default function PropuestaPage() {
  const { slug } = useParams();
  const propuesta = propuestasData[slug];

  if (!propuesta) {
    return (
      <div className="min-h-screen font-switzer bg-gradient-to-br from-slate-300 via-blue-200 to-slate-400 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Propuesta no encontrada</h1>
          <Button>
            <Link to="/propuestas">Volver a propuestas</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-switzer bg-gradient-to-br from-slate-300 via-blue-200 to-slate-400 pt-20">
      <Header />
      <AccessibilityMenu />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={propuesta.image || "/placeholder.svg"} alt={propuesta.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-200/80"></div>
        </div>

        <div className="relative py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center mb-6">
              <Button variant="ghost" size="sm" className="mr-4">
                <Link to="/propuestas">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a propuestas
                </Link>
              </Button>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div
                    className={`bg-gradient-to-br ${propuesta.color} w-16 h-16 rounded-xl flex items-center justify-center mr-4 shadow-lg`}
                  >
                    <propuesta.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <span className="text-sm text-slate-600 font-medium">{propuesta.area}</span>
                    <h1 className="text-4xl font-bold text-slate-800">{propuesta.name}</h1>
                  </div>
                </div>

                <div className="flex items-center space-x-6 mb-6 text-slate-700">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>{propuesta.duracion}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>{propuesta.modalidad}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>{propuesta.inscripcionesAbiertas ? "Inscripciones abiertas" : "Próximamente"}</span>
                  </div>
                </div>

                <p className="text-lg text-slate-700 mb-8 max-w-3xl">{propuesta.descripcion}</p>
              </div>

              {propuesta.inscripcionesAbiertas && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  INSCRIPCIONES ABIERTAS
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="w-5 h-5 mr-2" />
                Inscribirme ahora
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-800 hover:bg-slate-200">
                <FileText className="w-5 h-5 mr-2" />
                Descargar plan de estudios
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg p-6 border border-slate-300/60">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-blue-600" />
                  Objetivos de la carrera
                </h2>
                <ul className="space-y-3">
                  {propuesta.objetivos.map((objetivo, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{objetivo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg p-6 border border-slate-300/60">
                <h3 className="text-xl font-bold mb-4">Requisitos de ingreso</h3>
                <ul className="space-y-2">
                  {propuesta.requisitos.map((requisito, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{requisito}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
