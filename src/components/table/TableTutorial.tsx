import React, { useState } from 'react';
import Joyride, { 
  type CallBackProps, 
  STATUS, 
  type Step, 
  type TooltipRenderProps 
} from 'react-joyride';

import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TableTutorialProps {
  run: boolean;
  onFinish: () => void;
  darkMode: boolean;
}

// Custom Tooltip Component for total styling control
const TutorialTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  isLastStep,
  tooltipProps,
}: TooltipRenderProps) => {
  return (
    <div 
      {...tooltipProps}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/50 overflow-hidden max-w-sm"
    >
      {/* Header with Step Count and Close */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/50">
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Tip {index + 1}
        </span>
        <button 
          {...closeProps} 
          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-5">
        {step.title && (
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 cursor-pointer">
            {step.title}
          </h3>
        )}
        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {step.content}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50">
        <button 
          {...skipProps}
          className="text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors px-2 py-1 cursor-pointer"
        >
          Skip Tour
        </button>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <button
            {...primaryProps}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            {isLastStep ? 'Finish' : 'Next'}
            {!isLastStep && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TableTutorial: React.FC<TableTutorialProps> = ({
  run,
  onFinish,
  darkMode,
}) => {
  const [steps] = useState<Step[]>([
    {
      target: 'body',
      title: 'Welcome to Your Dashboard!',
      content: (
        <p>Let's take a quick tour to help you get started with managing your freelancer projects.</p>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.joyride-add-entry',
      title: 'Add Your First Project',
      content: (
        <p>Click here to create a new entry. You can add project details, deadlines, and potential earnings.</p>
      ),
      placement: 'bottom',
    },
    {
      target: '.joyride-filters',
      title: 'Filter & Search',
      content: (
        <p>Use these filters to quickly find projects by status or category. You can also toggle archived projects view.</p>
      ),
      placement: 'bottom',
    },
    {
      target: '.joyride-quick-filters',
      title: 'Quick Access',
      content: (
        <p>One-tap filters for your most common project statuses and categories.</p>
      ),
      placement: 'bottom',
    },
    {
      target: '.joyride-add-column',
      title: 'Custom Columns',
      content: (
        <p>Need to track more data? You can add custom columns to tailor the dashboard to your workflow.</p>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      title: 'Ready to Go!',
      content: (
        <p>We will create a sample "First Project" entry for you now so you can see how it works. Dive in!</p>
      ),
      placement: 'center',
    },
  ]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      scrollToFirstStep
      disableOverlayClose
      disableScrolling={true}
      spotlightPadding={4}
      callback={handleJoyrideCallback}
      tooltipComponent={TutorialTooltip}
      floaterProps={{
        hideArrow: true, // Cleaner look without arrow
      }}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: darkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)',
        }
      }}
    />
  );
};
