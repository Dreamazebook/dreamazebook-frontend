import React, { useState } from 'react';

const StepIndicator = () => {
  const [currentStep, setCurrentStep] = useState(2);

  const steps = [
    { id: 1, title: "Place Order" },
    { id: 2, title: "In Production" },
    { id: 3, title: "Transport" },
    { id: 4, title: "Receive Books" }
  ];

  const getStepContent = (step:any) => {
    const isCompleted = step.id < currentStep;
    const isCurrent = step.id === currentStep;
    
    // Step 1: Checkmark when completed
    if (step.id === 1 && isCompleted) {
      return (
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      );
    }

    // Step 2: 3D Box when current
    if (step.id === 2 && isCurrent) {
      return (
        <div className="relative">
          <div className="w-5 h-4 bg-orange-500 relative">
            <div className="w-full h-full bg-orange-500 border border-orange-600"></div>
            <div className="absolute -top-1 left-0 w-5 h-1 bg-orange-300 border border-orange-400 transform -skew-x-12 origin-bottom-left"></div>
            <div className="absolute top-0 -right-1 w-1 h-4 bg-orange-600 border border-orange-700 transform skew-y-12 origin-top-left"></div>
          </div>
        </div>
      );
    }

    // Default: show step number
    return (
      <span className={`font-bold text-lg ${isCompleted || isCurrent ? 'text-white' : 'text-gray-600'}`}>
        {step.id}
      </span>
    );
  };

  const getStepStyles = (step:any) => {
    const isCompleted = step.id < currentStep;
    const isCurrent = step.id === currentStep;
    
    return {
      circle: `w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative z-10 ${
        isCompleted ? 'bg-blue-600' : isCurrent ? 'bg-orange-400' : 'bg-gray-300'
      }`,
      text: `font-medium text-sm ${
        isCompleted || isCurrent ? 'text-blue-600' : 'text-gray-500'
      }`
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-8">
      {/* <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Step:</label>
        <select 
          value={currentStep} 
          onChange={(e) => setCurrentStep(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          {steps.map(step => (
            <option key={step.id} value={step.id}>Step {step.id}: {step.title}</option>
          ))}
        </select>
      </div> */}

      <div className="relative">
        {/* Full connecting line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300"></div>
        {/* Active portion of line */}
        {currentStep > 1 && (
          <div 
            className="absolute top-6 h-0.5 bg-blue-500 transition-all duration-500"
            style={{ 
              left: '24px',
              right: `calc(${100 - ((currentStep - 1) / (steps.length - 1)) * 100}% + 24px)` 
            }}
          />
        )}

        <div className="flex justify-between items-start relative">
          {steps.map((step) => {
            const styles = getStepStyles(step);
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={styles.circle}>
                  {getStepContent(step)}
                </div>
                <div className="mt-3">
                  <span className={styles.text}>{step.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;