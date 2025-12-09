import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface RedFlag {
  id: number;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  data_points: string[];
}

interface FraudExplanation {
  summary: string;
  red_flags: RedFlag[];
  recommendation: string;
  confidence_explanation: string;
  total_red_flags: number;
  risk_score: number;
}

interface FraudExplanationCardProps {
  explanation: FraudExplanation;
  claimId: string;
  riskLevel: string;
}

const FraudExplanationCard: React.FC<FraudExplanationCardProps> = ({
  explanation,
  claimId,
  riskLevel,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="w-4 h-4" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM':
        return <Info className="w-4 h-4" />;
      case 'LOW':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-600';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  const getRecommendationColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Fraud Analysis: Claim {claimId}
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getRiskLevelColor(riskLevel)}`}>
            {riskLevel} RISK
          </span>
          <span className="text-sm text-gray-500">
            {(explanation.risk_score * 100).toFixed(1)}% Probability
          </span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Executive Summary
        </h4>
        <p className="text-gray-700 leading-relaxed">{explanation.summary}</p>
      </div>

      {/* Confidence Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Confidence Assessment
        </h4>
        <p className="text-blue-800 text-sm">{explanation.confidence_explanation}</p>
      </div>

      {/* Red Flags */}
      {explanation.red_flags && explanation.red_flags.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
            Red Flags Identified ({explanation.total_red_flags})
          </h4>
          <div className="space-y-3">
            {explanation.red_flags.map((flag) => (
              <div
                key={flag.id}
                className={`border rounded-lg p-4 ${getSeverityColor(flag.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(flag.severity)}
                    <span className="font-semibold text-sm">{flag.category}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded">
                    {flag.severity}
                  </span>
                </div>
                <p className="text-sm mb-2">{flag.description}</p>
                {flag.data_points && flag.data_points.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                    <p className="text-xs font-semibold mb-1">Supporting Data:</p>
                    <ul className="text-xs space-y-1">
                      {flag.data_points.map((point, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className={`border rounded-lg p-4 ${getRecommendationColor(riskLevel)}`}>
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Recommended Action
        </h4>
        <p className="text-gray-800 leading-relaxed">{explanation.recommendation}</p>
      </div>

      {/* ML Independence Disclaimer */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-purple-900 mb-1 flex items-center">
          <Info className="w-3 h-3 mr-1" />
          How This Analysis Works
        </h4>
        <p className="text-xs text-purple-800">
          This fraud detection is powered by machine learning that analyzes transaction patterns,
          historical behavior, network relationships, and statistical anomalies. The system does NOT
          use pre-labeled fraud data for detection - it independently identifies suspicious patterns
          based on learned features from the data structure itself.
        </p>
      </div>
    </div>
  );
};

export default FraudExplanationCard;
