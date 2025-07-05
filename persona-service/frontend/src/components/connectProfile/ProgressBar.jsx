export function ProgressBar({ currentStep }) {
  const steps = [
    { id: 1, name: 'Documento' },
    { id: 2, name: 'Email' },
    { id: 3, name: 'Código' },
    { id: 4, name: 'Identidad' },
  ];

  return (
    <nav className="flex items-center justify-center mb-8">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`flex items-center ${
              index !== steps.length - 1 ? 'flex-1' : ''
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= index
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              <span
                className={`mt-2 text-sm ${
                  currentStep >= index ? 'text-primary font-medium' : 'text-gray-500'
                }`}
              >
                {step.name}
              </span>
            </div>
            {index !== steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 bg-gray-200">
                <div
                  className={`h-full ${
                    currentStep > index ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
