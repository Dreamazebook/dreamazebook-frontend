import { useState } from 'react';

export const useCheckoutSteps = () => {
  const [openStep, setOpenStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepNumber: number) => {
    if (openStep === stepNumber) {
      return;
    }
    
    if (completedSteps.includes(stepNumber) || stepNumber === openStep + 1) {
      setOpenStep(stepNumber);
    }
  };

  const completeStep = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
    setOpenStep(stepNumber + 1);
  };

  return {
    openStep,
    setOpenStep,
    completedSteps,
    setCompletedSteps,
    toggleStep,
    completeStep
  };
};