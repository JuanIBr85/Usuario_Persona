
import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  Volume2,
  VolumeX,
  Contrast,
  ZoomIn,
  ZoomOut,
  Bold,
  Underline,
  Eye,
  Puzzle,
} from 'lucide-react';

const AccesibilidadWidget = () => {
  const [abierto, setAbierto] = useState(false);
  const [vozActiva, setVozActiva] = useState(false);
  const [clasesActivas, setClasesActivas] = useState({
    dislexia: false,
    contraste: false,
    negrita: false,
    subrayado: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        setAbierto(prev => !prev); // Alternar visibilidad del menú
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  
  // Verificar clases activas al cargar el componente
  useEffect(() => {
    const body = document.body;
    setClasesActivas({
      dislexia: body.classList.contains('dislexia'),
      contraste: body.classList.contains('contraste'),
      negrita: body.classList.contains('negrita'),
      subrayado: body.classList.contains('subrayado'),
    });
  }, []);

  const toggleLectura = () => {
    const synth = window.speechSynthesis;

    if (!vozActiva) {
      const texto = document.body.innerText;
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-AR';
      synth.speak(utterance);
      setVozActiva(true);
      utterance.onend = () => setVozActiva(false);
    } else {
      synth.cancel();
      setVozActiva(false);
    }
  };

  const toggleClass = (clase) => {
    document.body.classList.toggle(clase);
    setClasesActivas(prev => ({
      ...prev,
      [clase]: !prev[clase]
    }));
  };

  const cambiarTamañoLetra = (factor) => {
    const html = document.documentElement;
    const actual = parseFloat(window.getComputedStyle(html).fontSize);
    html.style.fontSize = `${actual + factor}px`;
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4">
      <button
        onClick={() => setAbierto(!abierto)}
        className="bg-violet-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-violet-700 transition"
        aria-label="Abrir menú de accesibilidad"
      >
        <Accessibility size={18} />
        Accesibilidad
      </button>

      {abierto && (
        <div className="mt-2 w-64 bg-white shadow-xl rounded-2xl p-4 space-y-2 border border-gray-200 animate-fadeIn">
          <button
            onClick={toggleLectura}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${vozActiva ? 'bg-violet-200 text-violet-700 font-medium' : 'hover:bg-violet-100'}`}
            aria-pressed={vozActiva}
          >
            {vozActiva ? <VolumeX size={18} className="text-violet-600" /> : <Volume2 size={18} />}
            {vozActiva ? 'Detener lectura' : 'Leer página'}
          </button>
          
          <button 
            onClick={() => toggleClass('dislexia')} 
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${clasesActivas.dislexia ? 'bg-violet-200 text-violet-700 font-medium' : 'hover:bg-violet-100'}`}
            aria-pressed={clasesActivas.dislexia}
          >
            <Eye size={18} className={clasesActivas.dislexia ? 'text-violet-600' : ''} /> 
            Fuente disléxica
          </button>
          
          <button 
            onClick={() => cambiarTamañoLetra(2)} 
            className="w-full text-left hover:bg-violet-100 px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <ZoomIn size={18} /> 
            Aumentar letra
          </button>
          
          <button 
            onClick={() => cambiarTamañoLetra(-2)} 
            className="w-full text-left hover:bg-violet-100 px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <ZoomOut size={18} /> 
            Disminuir letra
          </button>
          
          <button 
            onClick={() => toggleClass('contraste')} 
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${clasesActivas.contraste ? 'bg-violet-200 text-violet-700 font-medium' : 'hover:bg-violet-100'}`}
            aria-pressed={clasesActivas.contraste}
          >
            <Contrast size={18} className={clasesActivas.contraste ? 'text-violet-600' : ''} /> 
            Contraste
          </button>
          
          <button 
            onClick={() => toggleClass('negrita')} 
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${clasesActivas.negrita ? 'bg-violet-200 text-violet-700 font-medium' : 'hover:bg-violet-100'}`}
            aria-pressed={clasesActivas.negrita}
          >
            <Bold size={18} className={clasesActivas.negrita ? 'text-violet-600' : ''} /> 
            Negrita
          </button>
          
          <button 
            onClick={() => toggleClass('subrayado')} 
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${clasesActivas.subrayado ? 'bg-violet-200 text-violet-700 font-medium' : 'hover:bg-violet-100'}`}
            aria-pressed={clasesActivas.subrayado}
          >
            <Underline size={18} className={clasesActivas.subrayado ? 'text-violet-600' : ''} /> 
            Subrayado
          </button>
          
          {/* <button onClick={() => toggleClass('pictogramas')} className="w-full text-left hover:bg-violet-100 px-3 py-2 rounded-lg flex items-center gap-2">
            <Puzzle size={18} /> Pictogramas
          </button> */}
        </div>
      )}
    </div>
  );
};

export default AccesibilidadWidget;
