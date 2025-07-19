import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * ScrollToTop
 *
 * Botón flotante que aparece al hacer scroll más allá de cierto límite
 * y permite volver suavemente al inicio de la página.
 */
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (


    <button
      onClick={scrollTop}
      aria-label="Volver arriba"
      className={`fixed bottom-20 right-4 md:bottom-24 md:right-8 z-40 p-2 rounded-full bg-[var(--color-primario)] text-white shadow transition-opacity ${visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
};

export default ScrollToTop;