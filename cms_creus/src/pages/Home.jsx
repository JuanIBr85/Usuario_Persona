import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'
import {
  Users,
  BookOpen,
  Award,
  FileText,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  Target,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import AccessibilityMenu from '../components/AccessibilityMenu'

const heroImages = [
  'https://scontent.fbhi10-1.fna.fbcdn.net/v/t39.30808-6/498316866_1099749675503725_242700373888450803_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=PeJK5W6l_TgQ7kNvwGQPeCB&_nc_oc=Adk-2Dsjz1OWH3wPFZq9uL5RrpspLB3-jlHmoj0d2fZzF-z1lXjRws73gAeQeg8rGEw&_nc_zt=23&_nc_ht=scontent.fbhi10-1.fna&_nc_gid=b3nsO17g-aC-cqRJ4nOwDQ&oh=00_AfPyvTaMmrA9gS1M_jqVL0KSZuZJsQ5UnNbPvVI4OPXpeQ&oe=685CC9CB',
  'https://scontent.fbhi10-1.fna.fbcdn.net/v/t39.30808-6/499880751_1099749678837058_8446717372345255132_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=MJz38DLfd6cQ7kNvwGBQju7&_nc_oc=AdkQA_XiDBaVTaYmf2tYOuorNrBhBNziiuPhdPkeODoy69OUBnnVr5f6IxbOOdrDIeE&_nc_zt=23&_nc_ht=scontent.fbhi10-1.fna&_nc_gid=7CwLHt4SAlHR4Ul4mIVAyw&oh=00_AfMf_guuZ-UE7ohWqnjtxG4WB4SCLj9d7Hge9LzoNR97kg&oe=685CC632',
  '/placeholder.svg?height=800&width=1200&text=Biblioteca',
  '/placeholder.svg?height=800&width=1200&text=Aulas+Modernas',
  '/placeholder.svg?height=800&width=1200&text=Estudiantes',
]

const propuestasDestacadas = [
  {
    id: 'programacion',
    name: 'Tecnicatura en Programación',
    icon: Target,
    color: 'from-blue-500 to-blue-600',
    image: 'https://cdn.euroinnova.edu.es/img/subidasEditor/code-1839406_640-1611692303.webp',
    area: 'Tecnología',
    inscripcionesAbiertas: true,
  },
  {
    id: 'enfermeria',
    name: 'Técnicatura en Enfermería',
    icon: Award,
    color: 'from-blue-400 to-blue-500',
    image: 'https://back.sise.edu.pe/uploads/8_razones_estudiar_enfermeria_beneficios_1a6a185775.jpg',
    area: 'Salud',
    inscripcionesAbiertas: true,
  },
  {
    id: 'prueba',
    name: 'Prueba',
    icon: Zap,
    color: 'from-cyan-500 to-cyan-600',
    image: '/placeholder.svg?height=200&width=300&text=Turismo',
    area: 'Prueba',
    inscripcionesAbiertas: false,
  },
]

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  return (
    <div className="min-h-screen transition-colors duration-300 font-switzer">
      {/* Background with centered gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 transition-colors duration-300 bg-gradient-to-br from-slate-300 via-blue-200 to-slate-400 opacity-95">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-30 bg-blue-600"></div>
        </div>
      </div>

      {/* Navigation */}
      <Header />

      {/* Hero Section with Image Carousel */}
      <main className="relative z-10 pt-32 pb-20">
        {/* Hero Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full overflow-hidden">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image || '/placeholder.svg'}
                  alt={`Campus CREUS ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-slate-200/70"></div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-slate-100/70 hover:bg-blue-600 hover:text-white text-slate-800 p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-slate-100/70 hover:bg-blue-600 hover:text-white text-slate-800 p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-blue-600' : 'bg-slate-400 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800 drop-shadow-sm">
            <span className="block">Centro Regional</span>
            <span className="block text-blue-600">Educativo Universitario</span>
            <span className="block text-cyan-600">Suarense</span>
          </h1>

          <p className="text-lg md:text-xl mb-8 text-slate-700 drop-shadow-sm">
            Formando profesionales para el futuro de nuestra región
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-5 h-5 mr-2" />
              Quiero inscribirme
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-800 hover:bg-slate-200 bg-slate-100/60 backdrop-blur-sm"
              asChild
            >
              <Link to="/propuesta">
                <BookOpen className="w-5 h-5 mr-2" />
                Ver propuesta académica
              </Link>
            </Button>
          </div>

          {/* Scroll Down Indicator */}
          <div className="flex flex-col items-center text-slate-700">
            <p className="text-sm mb-2">Desliza hacia abajo para descubrir más</p>
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>
        </div>
      </main>

      {/* Accessibility Menu */}
      <AccessibilityMenu />

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-blue-100/70 backdrop-blur-sm border-y border-blue-200/60">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">¿Por qué elegir CREUS?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-slate-50/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 border border-slate-300/60 hover:border-blue-400 shadow-md hover:shadow-lg">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Comunidad educativa</h3>
              <p className="text-slate-600">
                Una comunidad comprometida con la excelencia académica y el desarrollo integral de nuestros estudiantes.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-slate-50/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 border border-slate-300/60 hover:border-cyan-400 shadow-md hover:shadow-lg">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Propuesta innovadora</h3>
              <p className="text-slate-600">
                Ofrecemos propuestas técnicas y profesionales adaptadas a las necesidades del mercado laboral actual.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-slate-50/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 border border-slate-300/60 hover:border-slate-400 shadow-md hover:shadow-lg">
              <div className="bg-gradient-to-br from-slate-500 to-slate-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Excelencia académica</h3>
              <p className="text-slate-600">
                Reconocidos por nuestra calidad educativa y la inserción laboral de nuestros egresados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Propuestas Destacadas Section */}
      <section className="relative z-10 py-20 bg-slate-300/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800">Propuestas destacadas</h2>
            <Button variant="outline" className="border-slate-600 text-slate-700 hover:bg-slate-200" asChild>
              <Link to="/propuestas">
                Ver todas las propuestas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {propuestasDestacadas.map((propuesta, index) => {
              const IconComponent = propuesta.icon
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg bg-slate-100/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 border border-slate-400/60 hover:border-slate-500 shadow-md hover:shadow-lg"
                >
                  {/* Etiqueta de inscripciones */}
                  {propuesta.inscripcionesAbiertas && (
                    <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      INSCRIPCIONES ABIERTAS
                    </div>
                  )}

                  {/* Imagen */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={propuesta.image || '/placeholder.svg'}
                      alt={propuesta.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                    {/* Icono del área de conocimiento */}
                    <div className="absolute bottom-4 right-4">
                      <div
                        className={`bg-gradient-to-br ${propuesta.color} w-10 h-10 rounded-lg flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-medium">{propuesta.area}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-800">{propuesta.name}</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Formación integral con enfoque práctico y salida laboral inmediata.
                    </p>
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
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 bg-cyan-100/70 backdrop-blur-sm border-y border-cyan-200/60">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-lg bg-gradient-to-br from-blue-300 to-blue-400 border border-blue-500 shadow-md">
              <div className="text-4xl font-bold text-blue-800 mb-2">2020</div>
              <div className="text-slate-800">En funcionamiento desde</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-cyan-300 to-cyan-400 border border-cyan-500 shadow-md">
              <div className="text-4xl font-bold text-cyan-800 mb-2">+400</div>
              <div className="text-slate-800">Estudiantes</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 border border-slate-500 shadow-md">
              <div className="text-4xl font-bold text-slate-800 mb-2">+100</div>
              <div className="text-slate-800">Egresados</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-blue-300 to-blue-400 border border-blue-500 shadow-md">
              <div className="text-4xl font-bold text-blue-700 mb-2">+5</div>
              <div className="text-slate-800">Propuestas disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}