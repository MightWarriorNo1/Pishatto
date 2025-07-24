import React from 'react';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className="flex items-center justify-between max-w-[320px] mx-auto">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <React.Fragment key={idx}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border border-secondary text-white font-bold ${
              idx + 1 === currentStep
                ? 'bg-secondary' // current step
                : 'bg-primary'
            }`}
          >
            {idx + 1}
          </div>
          {idx < totalSteps - 1 && <div className="flex-1 h-[2px] bg-secondary"></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator; 