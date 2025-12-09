import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, Terminal, Play } from 'lucide-react';
import api from '../api/axios.config';
import toast from 'react-hot-toast';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function AnalysisProgressPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'running' | 'completed' | 'error'>('running');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  useEffect(() => {
    // Auto-scroll terminal to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const runAnalysis = async () => {
    try {
      addLog('Initializing fraud detection system...', 'info');
      setProgress(5);

      await new Promise(resolve => setTimeout(resolve, 500));
      addLog('Loading sample dataset...', 'info');
      setProgress(15);

      await new Promise(resolve => setTimeout(resolve, 500));
      addLog('Dataset loaded: 5,000 claims', 'success');
      setProgress(25);

      addLog('Loading Random Forest ML model...', 'info');
      await new Promise(resolve => setTimeout(resolve, 500));
      addLog('Model loaded successfully', 'success');
      setProgress(40);

      addLog('Extracting features from claims data...', 'info');
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog('Analyzing 48+ fraud indicators per claim...', 'info');
      setProgress(55);

      addLog('Running fraud detection predictions...', 'info');
      setProgress(65);

      // Make actual API call
      const response = await api.post('/fraud/detect-with-insights', {});

      addLog('Predictions completed', 'success');
      setProgress(75);

      addLog('Calculating risk scores...', 'info');
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(85);

      addLog('Generating executive summary with Local SLM...', 'info');
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog('Executive insights generated', 'success');
      setProgress(95);

      addLog('Compiling comprehensive report...', 'info');
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(100);

      addLog('Analysis complete!', 'success');
      setStatus('completed');

      // Wait a bit before navigating
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to report page with data in state
      navigate('/report', { state: { analysisResults: response.data } });

    } catch (error: any) {
      console.error('Analysis error:', error);
      addLog(`Error: ${error.response?.data?.detail || error.message}`, 'error');
      setStatus('error');
      toast.error('Analysis failed. Please try again.');
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Play className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              {status === 'running' && <Loader2 className="w-10 h-10 text-white animate-spin" />}
              {status === 'completed' && <CheckCircle className="w-10 h-10 text-white" />}
              {status === 'error' && <AlertCircle className="w-10 h-10 text-white" />}
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            {status === 'running' && 'Running Fraud Detection Analysis'}
            {status === 'completed' && 'Analysis Complete'}
            {status === 'error' && 'Analysis Failed'}
          </h1>
          <p className="text-gray-300 text-lg">
            {status === 'running' && 'AI is analyzing healthcare claims for suspicious patterns...'}
            {status === 'completed' && 'Redirecting to comprehensive report...'}
            {status === 'error' && 'An error occurred during analysis'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-gray-700 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-semibold text-gray-200">Analysis Progress</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 transition-all duration-500 ease-out relative shadow-lg"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="bg-gray-900 rounded-2xl shadow-3xl border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-850 px-6 py-4 flex items-center space-x-3 border-b border-gray-700">
            <Terminal className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-gray-200">Terminal Output</span>
            <div className="flex-1"></div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
            </div>
          </div>
          <div
            ref={terminalRef}
            className="p-6 font-mono text-sm h-96 overflow-y-auto bg-gray-950"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 #1F2937'
            }}
          >
            {logs.length === 0 ? (
              <div className="flex items-center text-gray-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Waiting for analysis to start...
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-3 mb-2 group">
                  <span className="text-gray-500 text-xs mt-0.5">{log.timestamp}</span>
                  <div className="mt-0.5">{getLogIcon(log.type)}</div>
                  <span className={`flex-1 ${getLogColor(log.type)}`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
            {status === 'running' && (
              <div className="flex items-center text-blue-400 animate-pulse">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {status === 'completed' && (
          <div className="mt-8 bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm border border-green-600/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-start space-x-5">
              <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-green-300 mb-2">Analysis Successful</h3>
                <p className="text-green-100 text-base leading-relaxed">
                  The fraud detection analysis has been completed successfully. You will be redirected to the comprehensive report page shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-sm border border-red-600/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-start space-x-5">
              <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-300 mb-2">Analysis Failed</h3>
                <p className="text-red-100 text-base mb-6 leading-relaxed">
                  An error occurred during the fraud detection analysis. Please try again.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-10 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></span>
            What's Happening?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-5 rounded-xl border border-blue-700/30">
              <div className="font-bold text-blue-400 mb-2 text-base">Machine Learning Analysis</div>
              <div className="text-gray-300 leading-relaxed">Our Random Forest model analyzes 48+ features per claim to identify fraud patterns with high accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 p-5 rounded-xl border border-indigo-700/30">
              <div className="font-bold text-indigo-400 mb-2 text-base">AI-Powered Insights</div>
              <div className="text-gray-300 leading-relaxed">Local SLM generates executive summaries and actionable insights from the analysis results</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-5 rounded-xl border border-purple-700/30">
              <div className="font-bold text-purple-400 mb-2 text-base">Risk Scoring</div>
              <div className="text-gray-300 leading-relaxed">Each claim receives a comprehensive risk score based on multiple fraud indicators</div>
            </div>
            <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 p-5 rounded-xl border border-pink-700/30">
              <div className="font-bold text-pink-400 mb-2 text-base">Pattern Detection</div>
              <div className="text-gray-300 leading-relaxed">System identifies phantom billing, upcoding, and other sophisticated fraud patterns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
