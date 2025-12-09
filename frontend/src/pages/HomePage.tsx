import { useState } from 'react';
import DatasetOverview from '../features/dataset/components/DatasetOverview';
import FraudDetectionPanel from '../features/fraud-detection/components/FraudDetectionPanel';
import AnalyticsDashboard from '../features/visualizations/components/AnalyticsDashboard';
import DataUpload from '../features/dataset/components/DataUpload';
import { Shield, Database, BarChart3, Upload, Info, LogOut } from 'lucide-react';
import { useAuthStore } from '../features/auth/store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type TabType = 'detection' | 'upload' | 'sample-data' | 'analytics';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('detection');
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const tabs = [
    { id: 'detection' as TabType, name: 'Fraud Detection', icon: Shield, description: 'Analyze claims for potential fraud' },
    { id: 'upload' as TabType, name: 'Upload Data', icon: Upload, description: 'Upload your own dataset' },
    { id: 'sample-data' as TabType, name: 'Sample Data', icon: Database, description: 'View sample dataset' },
    { id: 'analytics' as TabType, name: 'Analytics', icon: BarChart3, description: 'View detection metrics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Health Insurance Fraud Detection
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                AI-powered fraud detection to help protect against fraudulent insurance claims
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <Info className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Free Analysis Tool</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                    } group whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-all rounded-t-lg`}
                  >
                    <Icon className={`w-5 h-5 mr-2 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <div className="flex flex-col items-start">
                      <span>{tab.name}</span>
                      <span className="text-xs text-gray-500 font-normal">{tab.description}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'detection' && (
          <div className="space-y-6">
            {/* Instructional Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Shield className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">How Fraud Detection Works</h2>
                  <p className="text-indigo-100 mb-4">
                    Our AI system analyzes insurance claims to identify suspicious patterns that may indicate fraud.
                    The analysis considers claim amounts, patient history, provider patterns, and relationships between entities.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-1">1. Load Data</div>
                      <div className="text-xs text-indigo-100">Upload your claims or use sample data</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-1">2. Run Analysis</div>
                      <div className="text-xs text-indigo-100">AI examines patterns and anomalies</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-1">3. Review Results</div>
                      <div className="text-xs text-indigo-100">See fraud probability and risk factors</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fraud Detection Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <FraudDetectionPanel />
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Upload Instructions Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Upload Your Dataset</h2>
                  <p className="text-blue-100 mb-4">
                    You can upload your own insurance claims dataset for analysis. The system accepts CSV files with claims data.
                  </p>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-sm mb-2">Required Data Format:</h3>
                    <ul className="text-xs text-blue-100 space-y-1 list-disc list-inside">
                      <li>CSV file format</li>
                      <li>Columns: claim_id, patient_id, provider_id, claim_amount, service_date, diagnosis, procedure</li>
                      <li>Optional: actual_fraud_label (true/false) for accuracy measurement</li>
                      <li>Maximum file size: 50MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Component */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <DataUpload />
            </div>
          </div>
        )}

        {activeTab === 'sample-data' && (
          <div className="space-y-6">
            {/* Sample Data Info Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Database className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Sample Dataset Overview</h2>
                  <p className="text-green-100 mb-4">
                    This sample dataset contains synthetic health insurance claims generated for demonstration purposes.
                    It includes various types of claims, providers, and patients, with some claims marked as fraudulent to test the detection system.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-1">What's Included</div>
                      <ul className="text-xs text-green-100 space-y-1">
                        <li>Patient demographic information</li>
                        <li>Healthcare provider details</li>
                        <li>Insurance claims with procedures and diagnoses</li>
                        <li>Known fraud labels for testing accuracy</li>
                      </ul>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-1">Fraud Patterns</div>
                      <ul className="text-xs text-green-100 space-y-1">
                        <li>Phantom billing (deceased patients)</li>
                        <li>Upcoding (inflated procedures)</li>
                        <li>Excessive services</li>
                        <li>Provider fraud rings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dataset Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <DatasetOverview />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Info Banner */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Understanding Analytics</h2>
                  <p className="text-purple-100 mb-4">
                    These charts show how well the fraud detection system is performing. Higher accuracy, precision, and recall
                    scores indicate better detection capabilities.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-1">Accuracy</div>
                      <div className="text-xs text-purple-100">Overall correctness</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-1">Precision</div>
                      <div className="text-xs text-purple-100">True fraud rate</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-1">Recall</div>
                      <div className="text-xs text-purple-100">Fraud detection rate</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-1">F1 Score</div>
                      <div className="text-xs text-purple-100">Balanced measure</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <AnalyticsDashboard />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              This is a demonstration tool for educational purposes. Always consult with fraud investigation professionals
              for actual fraud detection needs.
            </p>
            <p className="text-xs text-gray-500">
              All sample data is synthetic and does not represent real individuals or claims.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
