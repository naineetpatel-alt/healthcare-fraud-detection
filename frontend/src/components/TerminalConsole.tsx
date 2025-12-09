import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'progress' | 'success' | 'info';
  delay?: number;
}

interface TerminalConsoleProps {
  isRunning: boolean;
  progress: number;
  onComplete?: () => void;
}

export default function TerminalConsole({ isRunning, progress, onComplete }: TerminalConsoleProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps: TerminalLine[] = [
    { text: '$ Starting fraud detection analysis...', type: 'command', delay: 100 },
    { text: '> Initializing AI-powered fraud detection engine', type: 'info', delay: 300 },
    { text: '> Loading your claim data into secure memory', type: 'info', delay: 500 },
    { text: '✓ Successfully loaded claims dataset', type: 'success', delay: 700 },
    { text: '', type: 'output', delay: 800 },
    { text: '$ Analyzing claim patterns...', type: 'command', delay: 900 },
    { text: '> Examining claim amounts and frequencies', type: 'info', delay: 1200 },
    { text: '> Checking for unusual billing patterns', type: 'info', delay: 1500 },
    { text: '> Comparing with historical fraud cases', type: 'info', delay: 1800 },
    { text: '✓ Pattern analysis complete', type: 'success', delay: 2100 },
    { text: '', type: 'output', delay: 2200 },
    { text: '$ Running machine learning detection...', type: 'command', delay: 2300 },
    { text: '> Applying advanced AI algorithms', type: 'info', delay: 2600 },
    { text: '> Calculating fraud probability scores', type: 'info', delay: 2900 },
    { text: '> Identifying suspicious relationships', type: 'info', delay: 3200 },
    { text: '> Evaluating provider behavior patterns', type: 'info', delay: 3500 },
    { text: '✓ ML detection complete', type: 'success', delay: 3800 },
    { text: '', type: 'output', delay: 3900 },
    { text: '$ Generating risk assessment report...', type: 'command', delay: 4000 },
    { text: '> Categorizing claims by risk level', type: 'info', delay: 4300 },
    { text: '> Identifying key risk factors', type: 'info', delay: 4600 },
    { text: '> Preparing detailed insights', type: 'info', delay: 4900 },
    { text: '✓ Analysis complete! Results ready for review', type: 'success', delay: 5200 },
  ];

  useEffect(() => {
    if (!isRunning) {
      setLines([]);
      setCurrentStep(0);
      return;
    }

    if (currentStep < analysisSteps.length) {
      const step = analysisSteps[currentStep];
      const timer = setTimeout(() => {
        setLines(prev => [...prev, step]);
        setCurrentStep(prev => prev + 1);

        // Call onComplete when we finish all steps
        if (currentStep === analysisSteps.length - 1 && onComplete) {
          setTimeout(() => onComplete(), 500);
        }
      }, step.delay || 0);

      return () => clearTimeout(timer);
    }
  }, [isRunning, currentStep]);

  // Reset when isRunning changes to true
  useEffect(() => {
    if (isRunning) {
      setLines([]);
      setCurrentStep(0);
    }
  }, [isRunning]);

  if (!isRunning && lines.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-green-400" />
        <span className="text-green-400 font-semibold">Fraud Detection Terminal</span>
        <div className="flex-1"></div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`${
              line.type === 'command'
                ? 'text-green-400'
                : line.type === 'success'
                ? 'text-emerald-400'
                : line.type === 'info'
                ? 'text-blue-300'
                : line.type === 'progress'
                ? 'text-yellow-300'
                : 'text-gray-400'
            } animate-[fadeIn_0.3s_ease-in]`}
          >
            {line.text || '\u00A0'}
          </div>
        ))}

        {isRunning && (
          <div className="flex items-center gap-2 text-yellow-300">
            <span>Progress: {progress}%</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="text-green-400 flex items-center gap-1">
            <span className="animate-pulse">▊</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
