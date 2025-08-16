import React from 'react';

const StepIndicator = () => {
  const steps = [
    { number: 1, label: 'place order', completed: true },
    { number: 2, label: 'Confirm the effect', completed: true },
    { number: 3, label: 'Print', completed: true },
    { number: 4, label: 'transport', completed: false },
    { number: 5, label: 'Receive books !', completed: false }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-gray-50">
      <div className="flex items-start justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-4 left-6 right-6 h-px bg-gray-300 z-0"></div>
        
        {/* Progress line active */}
        <div className="absolute top-4 left-6 h-px bg-blue-500 z-0" style={{ width: 'calc(50% - 12px)' }}></div>
        
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center relative z-10">
            {/* Circle with number */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-normal mb-2 border
              ${step.completed 
                ? 'bg-[#012CCE] text-white border-[#012CCE]' 
                : 'bg-white text-gray-400 border-gray-300'
              }
            `}>
              {step.number}
            </div>
            
            {/* Step label */}
            <div className={`
              text-xs text-center leading-tight
              ${step.completed ? 'text-[#012CCE]' : 'text-gray-400'}
            `} style={{ maxWidth: '70px' }}>
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;