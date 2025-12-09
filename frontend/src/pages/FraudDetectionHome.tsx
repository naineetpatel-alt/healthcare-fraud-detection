import { useState, useCallback } from 'react';
import { Upload, Database, FileText, Play, LogOut, Download, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../features/auth/store/authStore';
import { useFraudDetectionStore } from '../features/fraud-detection/store/fraudDetectionStore';
import toast from 'react-hot-toast';
import api from '../api/axios.config';

interface SchemaField {
  field_name: string;
  data_type: string;
  required: boolean;
  description: string;
  example: string;
}

interface DatasetSchema {
  patients: SchemaField[];
  providers: SchemaField[];
  claims: SchemaField[];
  policies: SchemaField[];
  diagnoses: SchemaField[];
  procedures: SchemaField[];
  medications: SchemaField[];
  pharmacies: SchemaField[];
}

export default function FraudDetectionHome() {
  const { user, logout } = useAuthStore();
  const { runFraudDetection, isDetecting, assessments, executiveSummary, insights } = useFraudDetectionStore();
  const [activeView, setActiveView] = useState<'home' | 'schema' | 'results'>('home');
  const [schema, setSchema] = useState<DatasetSchema | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const fetchSchema = useCallback(async () => {
    setIsLoadingSchema(true);
    try {
      const response = await api.get('/api/v1/dataset/schema');
      setSchema(response.data);
      setActiveView('schema');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load schema');
    } finally {
      setIsLoadingSchema(false);
    }
  }, []);

  const handleDownloadSample = async () => {
    try {
      const response = await api.get('/api/v1/dataset/sample/download', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_fraud_dataset.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Sample dataset downloaded');
    } catch (error: any) {
      toast.error('Failed to download sample dataset');
    }
  };

  const handleLoadSample = async () => {
    try {
      await api.post('/api/v1/dataset/sample/load');
      toast.success('Sample dataset loaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load sample dataset');
    }
  };

  const handleRunAnalysis = async () => {
    try {
      setActiveView('results');
      await runFraudDetection();
      toast.success('Fraud detection completed!');
    } catch (error) {
      toast.error('Fraud detection failed');
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    Array.from(uploadFiles).forEach(file => {
      const filename = file.name.toLowerCase();
      if (filename.includes('patient')) formData.append('patients', file);
      else if (filename.includes('provider')) formData.append('providers', file);
      else if (filename.includes('claim')) formData.append('claims', file);
      else if (filename.includes('polic')) formData.append('policies', file);
      else if (filename.includes('diagnos')) formData.append('diagnoses', file);
      else if (filename.includes('procedure')) formData.append('procedures', file);
      else if (filename.includes('medication')) formData.append('medications', file);
      else if (filename.includes('pharmac')) formData.append('pharmacies', file);
    });

    try {
      const response = await api.post('/api/v1/dataset/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message);
      setUploadFiles(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Insurance Fraud Detection System</h1>
              <p className="text-sm text-gray-600 mt-1">AI-Powered Fraud Analysis with Local SLM Insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveView('home')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'home'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={fetchSchema}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'schema'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Schema Documentation
            </button>
            {assessments.length > 0 && (
              <button
                onClick={() => setActiveView('results')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === 'results'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Results ({assessments.filter(a => a.is_fraud_predicted).length} fraud detected)
              </button>
            )}
          </nav>
        </div>

        {/* Home View */}
        {activeView === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upload Dataset Column */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Upload className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Upload Custom Dataset</h2>
                  <p className="text-sm text-gray-600">Analyze your own healthcare claims data</p>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    multiple
                    accept=".csv"
                    onChange={(e) => setUploadFiles(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {uploadFiles && uploadFiles.length > 0
                        ? `${uploadFiles.length} file(s) selected`
                        : 'Drag and drop CSV files here, or click to browse'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Supports: patients, providers, claims, policies, etc.
                    </p>
                  </label>
                </div>

                {uploadFiles && uploadFiles.length > 0 && (
                  <button
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Files'}
                  </button>
                )}

                <button
                  onClick={fetchSchema}
                  disabled={isLoadingSchema}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Schema Documentation
                </button>
              </div>
            </div>

            {/* Sample Dataset Column */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Sample Dataset</h2>
                  <p className="text-sm text-gray-600">Use pre-loaded healthcare claims data</p>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">1,000</p>
                      <p className="text-xs text-gray-600">Patients</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">100</p>
                      <p className="text-xs text-gray-600">Providers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">5,000</p>
                      <p className="text-xs text-gray-600">Claims</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isDetecting}
                    className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isDetecting ? 'Analyzing...' : 'Run Fraud Analysis'}
                  </button>

                  <button
                    onClick={handleLoadSample}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Load Sample Data
                  </button>

                  <button
                    onClick={handleDownloadSample}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fraud Detection Methodology Documentation */}
        {activeView === 'home' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertCircle className="w-6 h-6 mr-3 text-indigo-600" />
              Fraud Detection Methodology
            </h2>
            <p className="text-gray-700 mb-6">
              Our fraud detection system employs a multi-layered approach combining machine learning, advanced feature engineering,
              and AI-powered insights to identify suspicious healthcare insurance claims with high accuracy.
            </p>

            <div className="space-y-6">
              {/* Machine Learning Detection */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm font-bold mr-2">ML</span>
                  Machine Learning-Based Fraud Detection
                </h3>
                <p className="text-gray-700 mb-3">
                  At the core of our system is a <strong>Random Forest Classifier</strong>, an ensemble machine learning algorithm
                  that analyzes patterns across 48+ engineered features to predict fraud probability for each claim.
                </p>
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  <p className="text-sm text-gray-700"><strong>Algorithm:</strong> Random Forest (ensemble of 100 decision trees)</p>
                  <p className="text-sm text-gray-700"><strong>Features:</strong> 48+ extracted features covering claim patterns, provider behavior, patient history, and temporal trends</p>
                  <p className="text-sm text-gray-700"><strong>Performance:</strong> ~87% accuracy with AUC-ROC of 0.70 on test data</p>
                  <p className="text-sm text-gray-700"><strong>Output:</strong> Fraud probability (0-1), binary prediction, confidence score, and risk level classification</p>
                </div>
              </div>

              {/* Feature Engineering */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold mr-2">FE</span>
                  Advanced Feature Engineering
                </h3>
                <p className="text-gray-700 mb-3">
                  Features are automatically extracted from raw claim data across multiple dimensions to capture fraudulent patterns:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="font-semibold text-sm text-gray-900 mb-1">Claim Features</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Amount patterns (z-scores, percentiles)</li>
                      <li>Claim type distributions</li>
                      <li>Service date patterns</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="font-semibold text-sm text-gray-900 mb-1">Provider Features</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Historical claim volumes</li>
                      <li>Average claim amounts</li>
                      <li>Fraud history rates</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="font-semibold text-sm text-gray-900 mb-1">Patient Features</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Claim frequency patterns</li>
                      <li>Age-based risk factors</li>
                      <li>Historical spending trends</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="font-semibold text-sm text-gray-900 mb-1">Temporal Features</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Day of week patterns</li>
                      <li>Time-based anomalies</li>
                      <li>Seasonal trends</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Local SLM-Powered Insights */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-bold mr-2">AI</span>
                  Local SLM-Powered Executive Insights
                </h3>
                <p className="text-gray-700 mb-3">
                  After ML prediction, results are enhanced with <strong>Local SLM</strong> to generate executive-level summaries
                  and actionable insights tailored for healthcare executives.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded p-3 border border-purple-200">
                    <p className="font-semibold text-sm text-purple-900 mb-1">Executive Summary</p>
                    <p className="text-xs text-purple-800">
                      AI-generated overview highlighting key findings, fraud rates, financial impact, and immediate actions needed.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded p-3 border border-purple-200">
                    <p className="font-semibold text-sm text-purple-900 mb-1">Dynamic Insights</p>
                    <p className="text-xs text-purple-800">
                      Pattern-based insights identifying trends, risk hotspots, and anomalies with prioritized recommendations.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded p-3 border border-purple-200">
                    <p className="font-semibold text-sm text-purple-900 mb-1">Case Explanations</p>
                    <p className="text-xs text-purple-800">
                      Natural language explanations for each fraud case, making technical findings accessible to executives.
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment & Classification */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-bold mr-2">RA</span>
                  Risk Assessment & Classification
                </h3>
                <p className="text-gray-700 mb-3">
                  Each claim is assigned a risk level and confidence score based on fraud probability thresholds and model certainty:
                </p>
                <div className="bg-gray-50 rounded p-4">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-green-100 border border-green-300 rounded p-2">
                      <p className="text-xs font-bold text-green-800">MINIMAL</p>
                      <p className="text-xs text-green-700 mt-1">&lt; 0.3</p>
                    </div>
                    <div className="bg-blue-100 border border-blue-300 rounded p-2">
                      <p className="text-xs font-bold text-blue-800">LOW</p>
                      <p className="text-xs text-blue-700 mt-1">0.3-0.5</p>
                    </div>
                    <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
                      <p className="text-xs font-bold text-yellow-800">MEDIUM</p>
                      <p className="text-xs text-yellow-700 mt-1">0.5-0.7</p>
                    </div>
                    <div className="bg-orange-100 border border-orange-300 rounded p-2">
                      <p className="text-xs font-bold text-orange-800">HIGH</p>
                      <p className="text-xs text-orange-700 mt-1">0.7-0.85</p>
                    </div>
                    <div className="bg-red-100 border border-red-300 rounded p-2">
                      <p className="text-xs font-bold text-red-800">CRITICAL</p>
                      <p className="text-xs text-red-700 mt-1">&gt; 0.85</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    <strong>Confidence Score:</strong> Model certainty ranging from 0.5 (low confidence) to 1.0 (high confidence),
                    calculated from prediction probability and decision boundaries.
                  </p>
                </div>
              </div>

              {/* Red Flag Detection */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-bold mr-2">RF</span>
                  Red Flag Detection System
                </h3>
                <p className="text-gray-700 mb-3">
                  Rule-based red flags complement ML predictions by identifying specific fraud indicators across multiple categories:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-red-50 rounded p-2 border border-red-200">
                    <p className="text-xs font-semibold text-red-900">Amount Anomalies</p>
                    <p className="text-xs text-red-700 mt-1">Unusual claim amounts, statistical outliers</p>
                  </div>
                  <div className="bg-red-50 rounded p-2 border border-red-200">
                    <p className="text-xs font-semibold text-red-900">Provider Patterns</p>
                    <p className="text-xs text-red-700 mt-1">High-risk providers, suspicious billing</p>
                  </div>
                  <div className="bg-red-50 rounded p-2 border border-red-200">
                    <p className="text-xs font-semibold text-red-900">Patient Behavior</p>
                    <p className="text-xs text-red-700 mt-1">Claim frequency spikes, duplicates</p>
                  </div>
                  <div className="bg-red-50 rounded p-2 border border-red-200">
                    <p className="text-xs font-semibold text-red-900">Temporal Flags</p>
                    <p className="text-xs text-red-700 mt-1">Weekend claims, timing anomalies</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Red flags are categorized by severity (CRITICAL, HIGH, MEDIUM, LOW) and aggregated into a risk score
                  that feeds into the final fraud assessment.
                </p>
              </div>

              {/* Integration & Workflow */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Analysis Workflow</h3>
                <div className="flex items-center space-x-2 text-sm text-indigo-800">
                  <span className="bg-white px-3 py-1 rounded border border-indigo-300 font-medium">1. Data Ingestion</span>
                  <span className="text-indigo-600">→</span>
                  <span className="bg-white px-3 py-1 rounded border border-indigo-300 font-medium">2. Feature Extraction</span>
                  <span className="text-indigo-600">→</span>
                  <span className="bg-white px-3 py-1 rounded border border-indigo-300 font-medium">3. ML Prediction</span>
                  <span className="text-indigo-600">→</span>
                  <span className="bg-white px-3 py-1 rounded border border-indigo-300 font-medium">4. Red Flag Analysis</span>
                  <span className="text-indigo-600">→</span>
                  <span className="bg-white px-3 py-1 rounded border border-indigo-300 font-medium">5. AI Insights</span>
                  <span className="text-indigo-600">→</span>
                  <span className="bg-white px-3 py-1 rounded border border-indigo-300 font-medium">6. Results</span>
                </div>
                <p className="text-sm text-indigo-800 mt-3">
                  The entire analysis completes in seconds, processing thousands of claims with comprehensive fraud assessments
                  ready for executive review and investigative action.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Schema Documentation View */}
        {activeView === 'schema' && schema && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">CSV Schema Documentation</h2>
            <div className="space-y-6">
              {Object.entries(schema).map(([tableName, fields]) => (
                <div key={tableName} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{tableName}.csv</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fields.map((field: SchemaField, idx: number) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{field.field_name}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{field.data_type}</td>
                            <td className="px-4 py-2 text-sm">{field.required ? <CheckCircle className="w-4 h-4 text-green-600" /> : '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{field.description}</td>
                            <td className="px-4 py-2 text-sm text-gray-400 font-mono">{field.example}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results View */}
        {activeView === 'results' && assessments.length > 0 && (
          <div className="space-y-6">
            {/* Executive Summary */}
            {executiveSummary && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                  Executive Summary
                </h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {executiveSummary}
                </div>
              </div>
            )}

            {/* Dynamic Insights */}
            {insights && insights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className={`rounded-lg border-2 p-4 ${
                    insight.impact === 'High' ? 'border-red-300 bg-red-50' :
                    insight.impact === 'Medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-blue-300 bg-blue-50'
                  }`}>
                    <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        insight.impact === 'High' ? 'bg-red-200 text-red-800' :
                        insight.impact === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {insight.impact} Impact
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-xs font-medium text-gray-600">Action:</p>
                      <p className="text-xs text-gray-700 mt-1">{insight.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{assessments.length}</p>
              </div>
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Fraud Detected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {assessments.filter(a => a.is_fraud_predicted).length}
                </p>
              </div>
              <div className="bg-white border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {assessments.filter(a => a.risk_level === 'HIGH').length}
                </p>
              </div>
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {assessments.filter(a => a.risk_level === 'LOW').length}
                </p>
              </div>
            </div>

            {/* Note about detailed results */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Detailed Fraud Analysis</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    For detailed claim-by-claim analysis with explanations, navigate to the Fraud Detection page in the menu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
