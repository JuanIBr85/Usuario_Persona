import React from 'react';

export const ProgressBar = ({ currentStep }) => {
  const steps = ['Datos Personales', 'Contacto', 'Domicilio', 'Información Adicional', 'Resumen'];
  
  return (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {index + 1}
          </div>
          <span 
            className={`mt-2 text-xs text-center ${currentStep >= index ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
