import React from "react";

const Main = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  );
};

export default Main;
1