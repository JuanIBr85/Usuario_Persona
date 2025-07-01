import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Link } from 'react-router-dom'
import { BookOpen, UserPlus, MessageCircle, ExternalLink } from 'lucide-react'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-100/70 backdrop-blur-md shadow-lg' : 'bg-slate-200/60 backdrop-blur-sm'
      } text-slate-800 border-b border-slate-400/50`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center">
          <img
            src="https://www.creus.edu.ar/wp-content/uploads/2021/08/LogoCreus80x60.png"
            alt="CREUS Logo"
            className="h-[60px] w-[80px] object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center bg-slate-100/40 backdrop-blur-sm rounded-full px-6 py-2 border border-slate-300/60">
          <Link
            to="/propuestas"
            className="flex items-center space-x-1 hover:text-blue-600 transition-colors px-3 py-2 rounded-full hover:bg-slate-200/60"
          >
            <BookOpen className="w-4 h-4" />
            <span>Propuesta académica</span>
          </Link>
          <div className="w-px h-4 bg-slate-500/60 mx-2"></div>
          <a
            href="#inscripciones"
            className="flex items-center space-x-1 hover:text-blue-600 transition-colors px-3 py-2 rounded-full hover:bg-slate-200/60"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscripciones</span>
          </a>
          <div className="w-px h-4 bg-slate-500/60 mx-2"></div>
          <Link
            to="/contacto"
            className="flex items-center space-x-1 hover:text-blue-600 transition-colors px-3 py-2 rounded-full hover:bg-slate-200/60"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contacto</span>
          </Link>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1">
          <ExternalLink className="w-4 h-4" />
          <span>Iniciar sesión</span>
        </Button>
      </div>
    </nav>
  )
}