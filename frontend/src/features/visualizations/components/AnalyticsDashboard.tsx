import { useState } from 'react';
import FraudStatisticsChart from './FraudStatisticsChart';
import DetectionPerformanceChart from './DetectionPerformanceChart';
import { BarChart3, TrendingUp } from 'lucide-react';

type ViewType = 'statistics' | 'performance';

export default function AnalyticsDashboard() {
  const [activeView, setActiveView] = useState<ViewType>('statistics');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analytics & Visualizations
        </h2>
        <p className="text-gray-600">
          Interactive charts and performance metrics for fraud detection analysis
        </p>
      </div>

      {/* View Selector */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveView('statistics')}
          className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeView === 'statistics'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          Fraud Statistics
        </button>
        <button
          onClick={() => setActiveView('performance')}
          className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeView === 'performance'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Model Performance
        </button>
      </div>

      {/* Content */}
      <div>
        {activeView === 'statistics' && <FraudStatisticsChart />}
        {activeView === 'performance' && <DetectionPerformanceChart />}
      </div>
    </div>
  );
}
