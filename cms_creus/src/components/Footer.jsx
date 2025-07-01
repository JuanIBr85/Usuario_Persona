import { UserPlus, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { Button } from './ui/Button'

export default function Footer() {
  return (
    <footer className="relative z-10 py-16 bg-slate-100/90 backdrop-blur-sm border-t border-slate-300/60">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-start">
          {/* Logo and Description */}
          <div className="flex-1 text-left">
            <div className="flex items-center mb-4">
              <img
                src="https://www.creus.edu.ar/wp-content/uploads/2021/08/LogoCreus80x60.png"
                alt="CREUS Logo"
                className="h-[60px] w-[80px] object-contain"
              />
            </div>
            <p className="text-slate-700 text-sm mb-6">
              Formando profesionales comprometidos con el desarrollo de nuestra región desde 2020.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Inscribite
            </Button>
          </div>

          {/* Separador */}
          <div className="flex justify-center px-8">
            <div className="w-px h-32 bg-slate-300"></div>
          </div>

          {/* Información */}
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-slate-800 mb-4">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Términos de uso
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Reglamento académico
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Sugerencias
                </a>
              </li>
            </ul>
          </div>

          {/* Separador */}
          <div className="flex justify-center px-8">
            <div className="w-px h-32 bg-slate-300"></div>
          </div>

          {/* Conecta con Nosotros */}
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-slate-800 mb-4">Conectá con nosotros</h3>
            <div className="flex space-x-3 mb-4">
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <div className="text-slate-600 text-sm text-left">
              <p className="mb-2">📧 info@creus.edu.ar</p>
              <p className="mb-2">📞 (02923) 123-456</p>
              <p>📍 Av. Principal 123, Suárez</p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-300/60 mt-12 pt-8">
          <p className="text-slate-600 text-sm text-center">
            © 2025 CREUS - Centro Regional Educativo Universitario Suarense. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}