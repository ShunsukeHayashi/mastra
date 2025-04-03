import React from 'react';

const ProcessFlow: React.FC = () => {
  const steps = [
    'Goal Clarification',
    'UserInput',
    'Intent',
    'Elements',
    'Needs/Wants',
    'Deliverable Concept（P=g(N,W)）',
    'Message（M=g(N,W)）',
    'Contents（C=h(M)）',
    'Deliverable Outcome（O=f(C)）'
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center space-x-2 min-w-max py-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="bg-slate-800 px-3 py-2 rounded-md text-sm whitespace-nowrap">
              {step}
            </div>
            {index < steps.length - 1 && (
              <div className="text-secondary-500">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProcessFlow;
