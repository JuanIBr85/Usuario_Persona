import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Mail, Phone, MapPin, ArrowLeft, Clock } from "lucide-react"
import Header from '../components/Header'
import Footer from '../components/Footer'
import AccessibilityMenu from '../components/AccessibilityMenu'

export default function ContactoPage() {
  return (
    <div className="min-h-screen font-switzer bg-gradient-to-br from-slate-300 via-blue-200 to-slate-400 pt-20">
      <Header />
      <AccessibilityMenu />

      {/* Header */}
      <div className="bg-blue-100/70 backdrop-blur-sm border-b border-blue-200/60 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Contacto</h1>
          <p className="text-lg text-slate-700">
            Si tenés alguna duda, contáctanos para recibir más información al respecto.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Medios de contacto e información</h2>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-lg bg-slate-100/80 backdrop-blur-sm border border-slate-400/60 hover:border-blue-400 transition-all duration-300 shadow-md hover:shadow-lg">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-slate-800">Email</h3>
                  <p className="text-slate-600 mb-2">info@creus.edu.ar</p>
                  <p className="text-sm text-slate-500">Respuesta en 24-48 horas</p>
                </div>

                <div className="p-6 rounded-lg bg-slate-100/80 backdrop-blur-sm border border-slate-400/60 hover:border-cyan-400 transition-all duration-300 shadow-md hover:shadow-lg">
                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-slate-800">Teléfono</h3>
                  <p className="text-slate-600 mb-2">(02923) 123-456</p>
                  <p className="text-sm text-slate-500">Lunes a Viernes: 8:00 - 18:00</p>
                </div>

                <div className="p-6 rounded-lg bg-slate-100/80 backdrop-blur-sm border border-slate-400/60 hover:border-slate-500 transition-all duration-300 shadow-md hover:shadow-lg">
                  <div className="bg-gradient-to-br from-slate-500 to-slate-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-slate-800">Dirección</h3>
                  <p className="text-slate-600 mb-2">Av. Principal 123, Suárez</p>
                  <p className="text-sm text-slate-500">Buenos Aires, Argentina</p>
                </div>

                
                <div className="p-6 rounded-lg bg-slate-100/80 backdrop-blur-sm border border-slate-400/60 hover:border-green-400 transition-all duration-300 shadow-md hover:shadow-lg">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-slate-800">Horarios de atención</h3>
                  <div className="text-slate-600 space-y-1">
                    <p>Lunes a Viernes: 8:00 - 18:00</p>
                    <p>Sábados: 9:00 - 13:00</p>
                    <p className="text-sm text-slate-500">Domingos: Cerrado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-slate-200/70 backdrop-blur-sm border-t border-slate-300/60">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Nuestra ubicación</h2>

          <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg p-4 border border-slate-300/60 shadow-lg">
            <div className="w-full h-96 bg-slate-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-slate-600">
                <MapPin className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Mapa de Google Maps</p>
                <p className="text-xs mt-2 text-slate-500">
                  Falta integrarlo
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" className="border-slate-600 text-slate-700 hover:bg-slate-200">
              <MapPin className="w-4 h-4 mr-2" />
              Ver en Google Maps
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}