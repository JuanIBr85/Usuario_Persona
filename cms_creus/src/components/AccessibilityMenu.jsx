import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Accessibility,
  Volume2,
  VolumeX,
  Eye,
  Type,
  ZoomIn,
  ZoomOut,
  Palette,
  MousePointer,
  X,
} from "lucide-react";

export default function AccessibilityMenu() {
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [activeTab, setActiveTab] = useState("lectura");

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reduceTransparency: false,
    highContrast: false,
    dyslexicFont: false,
    boldText: false,
    underlineText: false,
    zoom: 100,
    largeCursor: false,
  });

  useEffect(() => {
    const html = document.documentElement;
    if (accessibilitySettings.zoom !== 100) {
      html.style.fontSize = `${accessibilitySettings.zoom}%`;
    } else {
      html.style.fontSize = "";
    }

    if (accessibilitySettings.highContrast) {
      html.style.filter = "contrast(150%) brightness(1.2)";
    } else {
      html.style.filter = "";
    }

    if (accessibilitySettings.largeCursor) {
      html.style.cursor =
        "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M2 2l8 20 4-8 8-4z' fill='black' stroke='white' strokeWidth='1'/%3E%3C/svg%3E\") 16 16, auto";
    } else {
      html.style.cursor = "";
    }

    const body = document.body;

    if (accessibilitySettings.dyslexicFont) {
      body.classList.add("dyslexic-font");
      body.style.fontFamily = "monospace, Arial, sans-serif";
    } else {
      body.classList.remove("dyslexic-font");
      body.style.fontFamily = "";
    }

    if (accessibilitySettings.boldText) {
      body.classList.add("bold-text");
      body.style.fontWeight = "bold";
    } else {
      body.classList.remove("bold-text");
      body.style.fontWeight = "";
    }

    if (accessibilitySettings.underlineText) {
      body.classList.add("underline-text");
      if (!document.getElementById("accessibility-underline")) {
        const style = document.createElement("style");
        style.id = "accessibility-underline";
        style.textContent = `
          .underline-text p, 
          .underline-text h1, 
          .underline-text h2, 
          .underline-text h3, 
          .underline-text h4, 
          .underline-text h5, 
          .underline-text h6,
          .underline-text span,
          .underline-text a,
          .underline-text button {
            text-decoration: underline !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      body.classList.remove("underline-text");
      const existingStyle = document.getElementById("accessibility-underline");
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [accessibilitySettings]);

  const readPage = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const mainContent = document.querySelector("main");
      const textContent = mainContent ? mainContent.innerText : document.body.innerText;
      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = "es-ES";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const updateAccessibilitySetting = (setting, value) => {
    setAccessibilitySettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const adjustZoom = (direction) => {
    const newZoom =
      direction === "in"
        ? Math.min(accessibilitySettings.zoom + 10, 150)
        : Math.max(accessibilitySettings.zoom - 10, 80);
    updateAccessibilitySetting("zoom", newZoom);
  };

  const tabs = [
    { id: "lectura", label: "Lectura", icon: Volume2 },
    { id: "diseno", label: "Diseño", icon: Eye },
    { id: "texto", label: "Texto", icon: Type },
    { id: "zoom", label: "Zoom", icon: ZoomIn },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {accessibilityOpen && (
          <div className={`absolute bottom-16 right-0 w-[350px] ${accessibilitySettings.reduceTransparency ? "bg-white/95" : "bg-white/85"} backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all duration-500 ease-in-out`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-violet-700 p-4 text-white shadow-lg flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl flex items-center">
                  <Accessibility className="w-6 h-6 mr-3" />
                  Accesibilidad
                </h3>
                <p className="text-violet-100 text-sm mt-1">
                  Ajustá tu experiencia de navegación según tus necesidades
                </p>
              </div>
              <button
                onClick={() => setAccessibilityOpen(false)}
                className="p-2 hover:bg-violet-500/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="p-4 bg-white/98">
              <div className="flex space-x-1 mb-6 bg-slate-50/80 rounded-xl p-1.5 shadow-inner border border-slate-200/60">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-white text-violet-600 shadow-md transform scale-105 border border-violet-200"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/60"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mb-1" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="h-40">
                {activeTab === "lectura" && (
                  <div className="space-y-3 text-center">
                    <h4 className="font-semibold text-slate-800 mb-1">Lectura de pantalla</h4>
                    <button
                      onClick={readPage}
                      className={`w-full p-3 rounded-xl border-2 flex items-center justify-center space-x-3 ${
                        isReading
                          ? "bg-gradient-to-r from-violet-600 to-violet-700 border-violet-500 text-white shadow-lg"
                          : "bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {isReading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      <span>{isReading ? "Detener lectura" : "Iniciar lectura"}</span>
                    </button>
                  </div>
                )}

                {activeTab === "diseno" && (
                  <div className="space-y-3 text-center">
                    <h4 className="font-semibold text-slate-800 mb-1">Ajustes visuales</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateAccessibilitySetting("reduceTransparency", !accessibilitySettings.reduceTransparency)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center space-y-2 ${
                          accessibilitySettings.reduceTransparency
                            ? "bg-gradient-to-br from-violet-600 to-violet-700 border-violet-500 text-white shadow-lg"
                            : "bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <Eye className="w-6 h-6" />
                        <span className="text-xs">Reducir transparencias</span>
                      </button>

                      <button
                        onClick={() => updateAccessibilitySetting("highContrast", !accessibilitySettings.highContrast)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center space-y-2 ${
                          accessibilitySettings.highContrast
                            ? "bg-gradient-to-br from-violet-600 to-violet-700 border-violet-500 text-white shadow-lg"
                            : "bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <Palette className="w-6 h-6" />
                        <span className="text-xs">Alto contraste</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "texto" && (
                  <div className="space-y-3 text-center">
                    <h4 className="font-semibold text-slate-800 mb-1">Formato de texto</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateAccessibilitySetting("dyslexicFont", !accessibilitySettings.dyslexicFont)}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 ${
                          accessibilitySettings.dyslexicFont
                            ? "bg-gradient-to-br from-violet-600 to-violet-700 border-violet-500 text-white"
                            : "bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <Type className="w-4 h-4" />
                        <span className="text-xs">Dislexia</span>
                      </button>

                      <button
                        onClick={() => updateAccessibilitySetting("boldText", !accessibilitySettings.boldText)}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 ${
                          accessibilitySettings.boldText
                            ? "bg-gradient-to-br from-violet-600 to-violet-700 border-violet-500 text-white"
                            : "bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <Type className="w-4 h-4" />
                        <span className="text-xs">Negrita</span>
                      </button>

                      <button
                        onClick={() => updateAccessibilitySetting("underlineText", !accessibilitySettings.underlineText)}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 ${
                          accessibilitySettings.underlineText
                            ? "bg-gradient-to-br from-violet-600 to-violet-700 border-violet-500 text-white"
                            : "bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <Type className="w-4 h-4" />
                        <span className="text-xs">Subrayado</span>
                      </button>

                      <button
                        onClick={() => updateAccessibilitySetting("largeCursor", !accessibilitySettings.largeCursor)}
                        className={`col-span-3 p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${
                          accessibilitySettings.largeCursor
                            ? "bg-gradient-to-br from-violet-600 to-violet-700 border-violet-500 text-white"
                            : "bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <MousePointer className="w-4 h-4" />
                        <span className="text-xs">Cursor grande</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "zoom" && (
                  <div className="space-y-3 text-center">
                    <h4 className="font-semibold text-slate-800 mb-1">Nivel de zoom</h4>
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => adjustZoom("out")}
                        disabled={accessibilitySettings.zoom <= 80}
                        className="p-3 rounded-xl border-2 bg-slate-50/90 text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <div className="text-xl font-bold">{accessibilitySettings.zoom}%</div>
                      <button
                        onClick={() => adjustZoom("in")}
                        disabled={accessibilitySettings.zoom >= 150}
                        className="p-3 rounded-xl border-2 bg-slate-50/90 text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={() => setAccessibilityOpen(!accessibilityOpen)}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-4 py-3 shadow-lg flex items-center space-x-2"
        >
          <Accessibility className="w-5 h-5" />
          <span className="text-sm">Accesibilidad</span>
          {accessibilityOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
