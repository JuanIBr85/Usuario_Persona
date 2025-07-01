import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [activeModals, setActiveModals] = useState(0);

  const openModal = () => {
    setActiveModals(prev => prev + 1);
  };

  const closeModal = () => {
    setActiveModals(prev => Math.max(0, prev - 1));
  };

  const hasActiveModals = activeModals > 0;

  return (
    <ModalContext.Provider value={{ openModal, closeModal, hasActiveModals }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  return useContext(ModalContext);
};