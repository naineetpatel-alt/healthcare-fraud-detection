import { Upload, Database, ArrowRight, LogOut, BookOpen, Sparkles, BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import toast from 'react-hot-toast';

export default function NewLandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Fraud Detection System
              </h1>
              <p className="text-xs text-gray-600">AI-Powered Healthcare Analytics</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/user-guide')}
                className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                User Guide
              </button>
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              Powered by Advanced AI & Machine Learning
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Healthcare Fraud Detection
            </span>
            <br />
            <span className="text-gray-900">Made Simple</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Detect fraudulent insurance claims with AI precision. Analyze thousands of claims in seconds
            <strong className="text-gray-900"> via API or batch processing</strong>, identify suspicious patterns,
            and generate executive-ready reports.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
            <div className="p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Upload Your Data
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Analyze your own healthcare claims dataset. Upload CSV files with claim details for custom fraud detection analysis.
              </p>
              <ul className="space-y-2.5 mb-8">
                <li className="flex items-center text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  CSV format with standard fields
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  Batch upload multiple files
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  Automatic validation & processing
                </li>
              </ul>
              <button
                onClick={() => navigate('/upload')}
                className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
              >
                Start Upload
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Sample Data Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-indigo-500">
            <div className="p-8 text-white">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-5 shadow-md">
                <Database className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Try Sample Data
              </h3>
              <p className="text-indigo-100 mb-6 leading-relaxed">
                Explore our pre-loaded dataset with 5,000 synthetic healthcare claims demonstrating various fraud patterns.
              </p>
              <ul className="space-y-2.5 mb-8">
                <li className="flex items-center text-sm text-indigo-100">
                  <div className="w-1.5 h-1.5 bg-white/80 rounded-full mr-3"></div>
                  5,000 sample insurance claims
                </li>
                <li className="flex items-center text-sm text-indigo-100">
                  <div className="w-1.5 h-1.5 bg-white/80 rounded-full mr-3"></div>
                  Known fraud patterns included
                </li>
                <li className="flex items-center text-sm text-indigo-100">
                  <div className="w-1.5 h-1.5 bg-white/80 rounded-full mr-3"></div>
                  Instant analysis & results
                </li>
              </ul>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/sample-viewer')}
                  className="flex items-center justify-center px-4 py-3.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  View Data
                </button>
                <button
                  onClick={() => navigate('/analysis')}
                  className="flex items-center justify-center px-4 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all group"
                >
                  Analyze
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Guide Banner */}
        <div className="max-w-5xl mx-auto mb-12">
          <div
            onClick={() => navigate('/user-guide')}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all group"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">New to Fraud Detection?</h3>
                  <p className="text-sm text-gray-700">
                    Read our comprehensive guide to understand how the system works, fraud types we detect, and best practices.
                  </p>
                </div>
              </div>
              <button className="flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                Read Guide
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Why Choose Our System</h3>
            <p className="text-gray-600">Powered by cutting-edge AI and designed for healthcare professionals</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Detection</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Random Forest ML model analyzes 48+ features per claim with industry-leading accuracy
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Executive Insights</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                AI-generated summaries transform complex data into actionable business intelligence
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Interactive Reports</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dynamic charts, sortable tables, and exportable PDFs for comprehensive analysis
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 rounded-2xl p-10 text-white shadow-xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Trusted by Healthcare Professionals</h3>
              <p className="text-indigo-200">Powerful fraud detection at your fingertips</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">48+</div>
                <div className="text-indigo-200 text-sm">Features Per Claim</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">5</div>
                <div className="text-indigo-200 text-sm">Fraud Types Detected</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">4</div>
                <div className="text-indigo-200 text-sm">Risk Categories</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">∞</div>
                <div className="text-indigo-200 text-sm">Scalable Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
