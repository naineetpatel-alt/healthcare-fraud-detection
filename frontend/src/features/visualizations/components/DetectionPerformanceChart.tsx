import { useFraudDetectionStore } from '../../fraud-detection/store/fraudDetectionStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DetectionPerformanceChart() {
  const { assessments } = useFraudDetectionStore();

  if (assessments.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <h3 className="text-sm font-medium text-gray-900">No Detection Results</h3>
        <p className="mt-1 text-sm text-gray-500">
          Run fraud detection from the "Fraud Detection" tab to see performance metrics
        </p>
      </div>
    );
  }

  // Calculate performance metrics
  const truePositives = assessments.filter(a => a.is_fraud_predicted && a.actual_fraud_label).length;
  const falsePositives = assessments.filter(a => a.is_fraud_predicted && !a.actual_fraud_label).length;
  const trueNegatives = assessments.filter(a => !a.is_fraud_predicted && !a.actual_fraud_label).length;
  const falseNegatives = assessments.filter(a => !a.is_fraud_predicted && a.actual_fraud_label).length;

  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const accuracy = (truePositives + trueNegatives) / assessments.length;
  const f1Score = (2 * precision * recall) / (precision + recall) || 0;

  const confusionMatrix = [
    { name: 'True Positive', value: truePositives, fill: '#10b981' },
    { name: 'False Positive', value: falsePositives, fill: '#f59e0b' },
    { name: 'True Negative', value: trueNegatives, fill: '#3b82f6' },
    { name: 'False Negative', value: falseNegatives, fill: '#ef4444' },
  ];

  const performanceMetrics = [
    { name: 'Accuracy', value: accuracy * 100 },
    { name: 'Precision', value: precision * 100 },
    { name: 'Recall', value: recall * 100 },
    { name: 'F1 Score', value: f1Score * 100 },
  ];

  // Risk distribution
  const riskDistribution = [
    { name: 'High Risk', count: assessments.filter(a => a.risk_level === 'HIGH').length },
    { name: 'Medium Risk', count: assessments.filter(a => a.risk_level === 'MEDIUM').length },
    { name: 'Low Risk', count: assessments.filter(a => a.risk_level === 'LOW').length },
  ];

  // Fraud probability distribution (bucketed)
  const probabilityBuckets = [
    { name: '0-20%', count: assessments.filter(a => a.fraud_probability < 0.2).length },
    { name: '20-40%', count: assessments.filter(a => a.fraud_probability >= 0.2 && a.fraud_probability < 0.4).length },
    { name: '40-60%', count: assessments.filter(a => a.fraud_probability >= 0.4 && a.fraud_probability < 0.6).length },
    { name: '60-80%', count: assessments.filter(a => a.fraud_probability >= 0.6 && a.fraud_probability < 0.8).length },
    { name: '80-100%', count: assessments.filter(a => a.fraud_probability >= 0.8).length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Model Performance Analysis
        </h3>
        <p className="text-gray-600">
          Based on {assessments.length} analyzed claims
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Metrics
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confusion Matrix */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Confusion Matrix
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confusionMatrix}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {confusionMatrix.map((entry, index) => (
                  <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Risk Level Distribution
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fraud Probability Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Fraud Score Distribution
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={probabilityBuckets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Accuracy</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {(accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {truePositives + trueNegatives} correct predictions
          </div>
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Precision</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {(precision * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {truePositives} true positives
          </div>
        </div>
        <div className="bg-white border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Recall</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {(recall * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {truePositives} of {truePositives + falseNegatives} fraud detected
          </div>
        </div>
        <div className="bg-white border border-indigo-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">F1 Score</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {(f1Score * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Harmonic mean
          </div>
        </div>
      </div>
    </div>
  );
}
