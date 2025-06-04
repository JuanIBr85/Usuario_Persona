import React from "react";

/**
 * Componente Main
 * 
 * Envuelve el contenido principal entre el header y el footer,
 * permitiendo que el contenido tenga scroll independiente.
 */

const Main = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  );
};

export default Main;
