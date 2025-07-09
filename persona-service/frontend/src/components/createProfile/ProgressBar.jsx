import React from 'react';

export const ProgressBar = ({ currentStep, setCurrentStep, steps, size = 10 }) => {
  return (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center cursor-pointer" onClick={() => setCurrentStep&&setCurrentStep(index)}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
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
