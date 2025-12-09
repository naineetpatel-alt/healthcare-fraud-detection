import { useState } from 'react';
import { useFraudDetectionStore } from '../store/fraudDetectionStore';
import { AlertTriangle, CheckCircle, XCircle, Play, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import TerminalConsole from '../../../components/TerminalConsole';
import FraudExplanationCard from './FraudExplanationCard';

export default function FraudDetectionPanel() {
  const { assessments, isDetecting, progress, error, runFraudDetection, clearAssessments } = useFraudDetectionStore();
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  const handleRunDetection = async () => {
    try {
      await runFraudDetection();
      toast.success('Fraud detection completed!');
    } catch (error) {
      toast.error('Fraud detection failed');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const highRiskCount = assessments.filter(a => a.risk_level === 'HIGH').length;
  const mediumRiskCount = assessments.filter(a => a.risk_level === 'MEDIUM').length;
  const lowRiskCount = assessments.filter(a => a.risk_level === 'LOW').length;
  const fraudDetectedCount = assessments.filter(a => a.is_fraud_predicted).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fraud Detection</h2>
        <p className="text-gray-600">
          Run ML-based fraud detection on insurance claims to identify suspicious patterns
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Run Detection</h3>
            <p className="text-sm text-gray-600 mt-1">
              Analyze claims using machine learning fraud detection model
            </p>
          </div>
          <button
            onClick={handleRunDetection}
            disabled={isDetecting}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDetecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Run Detection
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Terminal Console */}
      <TerminalConsole
        isRunning={isDetecting}
        progress={progress}
        onComplete={() => {
          if (assessments.length > 0) {
            toast.success(`Analysis complete! Found ${assessments.filter(a => a.is_fraud_predicted).length} potential fraud cases.`);
          }
        }}
      />

      {/* Results Summary */}
      {assessments.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{assessments.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{highRiskCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{mediumRiskCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Risk</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{lowRiskCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Detection Results ({fraudDetectedCount} potential fraud detected)
              </h3>
              <button
                onClick={clearAssessments}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Results
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claim ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fraud Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prediction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Factors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <>
                      <tr
                        key={assessment.claim_id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setExpandedClaimId(expandedClaimId === assessment.claim_id ? null : assessment.claim_id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assessment.claim_id}
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${assessment.claim_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                            <div
                              className={`h-full ${
                                assessment.fraud_probability > 0.7
                                  ? 'bg-red-500'
                                  : assessment.fraud_probability > 0.4
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${assessment.fraud_probability * 100}%` }}
                            ></div>
                          </div>
                          <span>{(assessment.fraud_probability * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          <span className={`font-semibold ${
                            assessment.confidence > 0.8 ? 'text-green-600' :
                            assessment.confidence > 0.6 ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {(assessment.confidence * 100).toFixed(0)}%
                          </span>
                          <span className="text-gray-400 text-xs">certain</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${getRiskColor(assessment.risk_level)}`}>
                          {assessment.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assessment.is_fraud_predicted ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                            FRAUD
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs">
                          {assessment.risk_factors.slice(0, 2).map((riskFactor, idx) => (
                            <div key={idx} className="text-xs truncate">
                              • {riskFactor.factor} ({riskFactor.value.toFixed(2)})
                            </div>
                          ))}
                          {assessment.risk_factors.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{assessment.risk_factors.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedClaimId(expandedClaimId === assessment.claim_id ? null : assessment.claim_id);
                          }}
                          className="flex items-center text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          {expandedClaimId === assessment.claim_id ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Details
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedClaimId === assessment.claim_id && assessment.explanation && (
                      <tr key={`${assessment.claim_id}-expanded`}>
                        <td colSpan={8} className="px-6 py-6 bg-gray-50">
                          <FraudExplanationCard
                            explanation={assessment.explanation}
                            claimId={assessment.claim_id}
                            riskLevel={assessment.risk_level}
                          />
                        </td>
                      </tr>
                    )}
                    {expandedClaimId === assessment.claim_id && !assessment.explanation && (
                      <tr key={`${assessment.claim_id}-no-explanation`}>
                        <td colSpan={8} className="px-6 py-6 bg-gray-50">
                          <div className="text-center text-gray-500">
                            <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                            <p>No detailed explanation available for this claim.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!isDetecting && assessments.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click "Run Detection" to analyze claims for potential fraud
          </p>
        </div>
      )}
    </div>
  );
}
