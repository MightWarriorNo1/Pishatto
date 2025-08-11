/*eslint-disable */
import React from 'react';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ totalSteps, currentStep }) => {
  return (
    <nav aria-label="進行状況">
      <ol className="flex items-center justify-between max-w-[360px] mx-auto" role="list">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <li key={idx} className="flex items-center flex-1 min-w-0">
            <div
              aria-current={idx + 1 === currentStep ? 'step' : undefined}
              aria-label={`ステップ${idx + 1} / ${totalSteps}`}
              className={`w-9 h-9 rounded-full flex items-center justify-center border text-white font-bold transition-colors duration-200 ${
                idx + 1 === currentStep
                  ? 'bg-secondary border-secondary'
                  : 'bg-primary border-secondary'
              }`}
            >
              {idx + 1}
            </div>
            {idx < totalSteps - 1 && (
              <div
                className="flex-1 h-[2px] mx-2 bg-secondary/50"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator; 