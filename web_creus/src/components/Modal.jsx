import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (isOpen) {
      openModal();
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (isOpen) {
        closeModal();
        document.body.style.overflow = 'auto';
      }
    };
  }, [isOpen, openModal, closeModal]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal-overlay-fixed">
      <div className="modal-backdrop" onClick={handleClose}></div>
      <div 
        className={`modal-content-centered ${sizeClasses[size] || sizeClasses.md}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          </div>
          <button 
            onClick={handleClose} 
            className="btn btn-ghost btn-icon btn-sm" 
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;