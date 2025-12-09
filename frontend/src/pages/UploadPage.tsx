import { ArrowLeft, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataUpload from '../features/dataset/components/DataUpload';

export default function UploadPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upload Custom Dataset</h1>
                <p className="text-sm text-gray-600">Upload your own insurance claims data for fraud analysis</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/analysis')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Run Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <DataUpload />
        </div>
      </div>
    </div>
  );
}
