import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Lightbulb,
  Shield,
  FileText,
  Loader2,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import { exportToPDF } from '../utils/pdfExport';

interface FraudPrediction {
  claim_id: string;
  patient_id: string;
  provider_id: string;
  claim_amount: number;
  service_date: string;
  diagnosis: string;
  procedure: string;
  fraud_probability: number;
  risk_level: string;
  is_fraud: boolean;
  explanation: any;
  confidence?: number;
  risk_factors?: Array<{ factor: string; value: number }>;
  actual_fraud_type?: string;
}

interface AnalysisResults {
  total_analyzed: number;
  fraud_detected: number;
  predictions: FraudPrediction[];
  executive_summary: string;
  insights: any[];
  statistics: any;
}

type SortField = 'claim_id' | 'fraud_probability' | 'claim_amount' | 'risk_level';
type SortDirection = 'asc' | 'desc';

export default function ReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('fraud_probability');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterRisk, setFilterRisk] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRiskDropdownOpen, setIsRiskDropdownOpen] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = () => {
    try {
      const analysisResults = (location.state as any)?.analysisResults;
      if (analysisResults) {
        console.log('📊 Analysis Results Data Structure:', {
          total_analyzed: analysisResults.total_analyzed,
          fraud_detected: analysisResults.fraud_detected,
          predictions_count: analysisResults.predictions?.length,
          has_executive_summary: !!analysisResults.executive_summary,
          has_insights: !!analysisResults.insights,
          data_keys: Object.keys(analysisResults)
        });
        setResults(analysisResults);
      } else {
        toast.error('No analysis results found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleRowExpansion = (claimId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(claimId)) {
      newExpanded.delete(claimId);
    } else {
      newExpanded.add(claimId);
    }
    setExpandedRows(newExpanded);
  };

  const filteredAndSortedPredictions = useMemo(() => {
    if (!results) return [];

    let filtered = results.predictions;

    // Multi-select risk filter
    if (filterRisk.length > 0) {
      filtered = filtered.filter(p => filterRisk.includes(p.risk_level));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.claim_id.toLowerCase().includes(query) ||
        p.patient_id.toLowerCase().includes(query) ||
        p.provider_id.toLowerCase().includes(query)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'risk_level') {
        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        aVal = riskOrder[a.risk_level.toLowerCase() as keyof typeof riskOrder] || 0;
        bVal = riskOrder[b.risk_level.toLowerCase() as keyof typeof riskOrder] || 0;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [results, sortField, sortDirection, filterRisk, searchQuery]);

  // Paginated data
  const paginatedPredictions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedPredictions.slice(startIndex, endIndex);
  }, [filteredAndSortedPredictions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedPredictions.length / itemsPerPage);

  // Chart data - FIXED to use is_fraud_predicted
  const riskDistributionData = useMemo(() => {
    if (!results) return [];
    const distribution: Record<string, number> = {};
    results.predictions.forEach(p => {
      distribution[p.risk_level] = (distribution[p.risk_level] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [results]);

  const fraudTrendData = useMemo(() => {
    if (!results) return [];
    const byDate: Record<string, { fraud: number; normal: number }> = {};
    results.predictions.forEach((p: any) => {
      const date = new Date(p.service_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!byDate[date]) {
        byDate[date] = { fraud: 0, normal: 0 };
      }
      if (p.is_fraud_predicted) {
        byDate[date].fraud++;
      } else {
        byDate[date].normal++;
      }
    });
    return Object.entries(byDate).slice(0, 10).map(([date, counts]) => ({
      date,
      fraud: counts.fraud,
      normal: counts.normal
    }));
  }, [results]);

  const topProvidersData = useMemo(() => {
    if (!results) return [];
    const providerFraud: Record<string, number> = {};
    results.predictions.forEach((p: any) => {
      if (p.is_fraud_predicted) {
        providerFraud[p.provider_id] = (providerFraud[p.provider_id] || 0) + 1;
      }
    });
    return Object.entries(providerFraud)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([provider, count]) => ({ provider, count }));
  }, [results]);

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Preparing your report...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Elegant Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <button
                onClick={() => navigate('/')}
                className="p-2.5 hover:bg-indigo-50 rounded-xl transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Fraud Analysis Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-0.5">AI-Powered Healthcare Fraud Detection</p>
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                if (!results || isExporting) return;

                // Set state immediately and let UI update before heavy work
                setIsExporting(true);

                // Give React a chance to update the UI
                await new Promise(resolve => setTimeout(resolve, 0));

                // Hide detailed claims section for faster PDF generation
                const detailedSection = document.getElementById('detailed-claims-section');
                const originalDisplay = detailedSection?.style.display;
                if (detailedSection) {
                  detailedSection.style.display = 'none';
                }

                try {
                  await exportToPDF(
                    'report-content',
                    `fraud-analysis-${new Date().toISOString().split('T')[0]}.pdf`
                  );
                } catch (error) {
                  console.error('PDF export error:', error);
                } finally {
                  // Restore detailed claims section
                  if (detailedSection && originalDisplay !== undefined) {
                    detailedSection.style.display = originalDisplay;
                  } else if (detailedSection) {
                    detailedSection.style.display = '';
                  }
                  setIsExporting(false);
                }
              }}
              disabled={isExporting || !results}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div id="report-content" className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        {/* Professional Executive Summary with Markdown */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Executive Summary</h2>
                <p className="text-indigo-100 text-sm mt-1">AI-Generated Insights for Healthcare Executives</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="prose prose-indigo max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 flex items-center" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4" {...props} />,
                  li: ({node, ...props}) => <li className="ml-2" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />
                }}
              >
                {results.executive_summary || 'Analysis completed successfully. The fraud detection system has identified suspicious patterns in the submitted claims. Review the detailed findings below for specific risk assessments and recommended actions.'}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Modern Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total Claims</span>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {(results.total_analyzed || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-2 font-medium">Analyzed by ML Model</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Fraud Detected</span>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
              {(results.fraud_detected || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 mt-2 font-bold">
              {results.total_analyzed > 0 ? ((results.fraud_detected / results.total_analyzed) * 100).toFixed(1) : '0.0'}% Fraud Rate
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Amount at Risk</span>
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-br from-orange-600 to-orange-800 bg-clip-text text-transparent">
              ${((results.predictions || []).filter((p: any) => p.is_fraud_predicted).reduce((sum: number, p: any) => sum + (p.claim_amount || 0), 0) / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-500 mt-2 font-medium">Flagged Claims Total</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">High Risk</span>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
              {((results.predictions || []).filter((p: any) => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL').length).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-2 font-medium">Immediate Attention Required</div>
          </div>
        </div>

        {/* Dynamic Insights */}
        {results.insights && results.insights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Key Insights & Recommendations</h2>
                  <p className="text-amber-100 text-sm mt-0.5">Actionable Intelligence for Investigation</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.insights.map((insight: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all">
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                      insight.impact === 'High' ? 'bg-red-100 text-red-700' :
                      insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {insight.impact} Impact
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-base">{insight.title}</h3>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{insight.description}</p>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-indigo-600">→ {insight.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Visual Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Risk Distribution */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistributionData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Providers */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Fraud Providers</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProvidersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="provider" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fraud Trend */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Detection Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={fraudTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                <Legend />
                <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={3} name="Fraudulent" dot={{r: 5}} />
                <Line type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={3} name="Legitimate" dot={{r: 5}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Table */}
        <div id="detailed-claims-section" className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detailed Claims Analysis</h2>
                <p className="text-sm text-gray-600 mt-1">Sortable and filterable fraud predictions</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsRiskDropdownOpen(!isRiskDropdownOpen)}
                    className="flex items-center space-x-2 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {filterRisk.length === 0 ? 'Filter by Risk' : `Risk (${filterRisk.length})`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isRiskDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isRiskDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsRiskDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-xl shadow-lg z-20 py-2">
                        <div className="px-3 py-2 border-b border-gray-200">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Risk Levels</span>
                        </div>
                        <div className="py-2">
                          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={filterRisk.includes('CRITICAL')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterRisk([...filterRisk, 'CRITICAL']);
                                } else {
                                  setFilterRisk(filterRisk.filter(r => r !== 'CRITICAL'));
                                }
                                setCurrentPage(1);
                              }}
                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">Critical</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={filterRisk.includes('HIGH')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterRisk([...filterRisk, 'HIGH']);
                                } else {
                                  setFilterRisk(filterRisk.filter(r => r !== 'HIGH'));
                                }
                                setCurrentPage(1);
                              }}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">High</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={filterRisk.includes('MEDIUM')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterRisk([...filterRisk, 'MEDIUM']);
                                } else {
                                  setFilterRisk(filterRisk.filter(r => r !== 'MEDIUM'));
                                }
                                setCurrentPage(1);
                              }}
                              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                            />
                            <span className="text-sm text-gray-700">Medium</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={filterRisk.includes('LOW')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterRisk([...filterRisk, 'LOW']);
                                } else {
                                  setFilterRisk(filterRisk.filter(r => r !== 'LOW'));
                                }
                                setCurrentPage(1);
                              }}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Low</span>
                          </label>
                        </div>
                        {filterRisk.length > 0 && (
                          <div className="px-3 py-2 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setFilterRisk([]);
                                setCurrentPage(1);
                              }}
                              className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium text-center"
                            >
                              Clear All
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-2.5 text-left">
                    <button
                      onClick={() => handleSort('claim_id')}
                      className="flex items-center space-x-1 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                    >
                      <span>Claim ID</span>
                      {sortField === 'claim_id' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Patient / Provider
                  </th>
                  <th className="px-6 py-2.5 text-left">
                    <button
                      onClick={() => handleSort('claim_amount')}
                      className="flex items-center space-x-1 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                    >
                      <span>Amount</span>
                      {sortField === 'claim_amount' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-2.5 text-left">
                    <button
                      onClick={() => handleSort('fraud_probability')}
                      className="flex items-center space-x-1 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                    >
                      <span>Fraud Probability</span>
                      {sortField === 'fraud_probability' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-2.5 text-left">
                    <button
                      onClick={() => handleSort('risk_level')}
                      className="flex items-center space-x-1 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                    >
                      <span>Risk Level</span>
                      {sortField === 'risk_level' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAndSortedPredictions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-gray-400 text-lg font-medium">No claims found matching your filters</div>
                    </td>
                  </tr>
                ) : (
                  paginatedPredictions.map((prediction) => (
                    <>
                      <tr key={prediction.claim_id} className="hover:bg-indigo-50/50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">{prediction.claim_id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{prediction.patient_id}</div>
                          <div className="text-xs text-gray-500">{prediction.provider_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">${prediction.claim_amount.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className={`h-2 rounded-full ${
                                  prediction.fraud_probability > 0.7 ? 'bg-red-600' :
                                  prediction.fraud_probability > 0.4 ? 'bg-yellow-600' :
                                  'bg-green-600'
                                }`}
                                style={{ width: `${prediction.fraud_probability * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {(prediction.fraud_probability * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getRiskColor(prediction.risk_level)}`}>
                            {prediction.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => toggleRowExpansion(prediction.claim_id)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center space-x-1"
                          >
                            <span>{expandedRows.has(prediction.claim_id) ? 'Hide' : 'View'}</span>
                            {expandedRows.has(prediction.claim_id) ?
                              <ChevronUp className="w-4 h-4" /> :
                              <ChevronDown className="w-4 h-4" />
                            }
                          </button>
                        </td>
                      </tr>

                      {expandedRows.has(prediction.claim_id) && (
                        <tr className="bg-gradient-to-br from-gray-50 to-indigo-50/30">
                          <td colSpan={6} className="px-8 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Claim Details */}
                              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center text-base">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  </div>
                                  Claim Information
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Service Date:</span>
                                    <span className="text-gray-900 font-semibold">{prediction.service_date}</span>
                                  </div>
                                  {prediction.confidence && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 font-medium">ML Confidence:</span>
                                      <span className="text-gray-900 font-semibold">{(prediction.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                  )}
                                  {prediction.actual_fraud_type && (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">Fraud Pattern:</span>
                                        <span className="text-red-600 font-bold text-xs uppercase tracking-wide">{prediction.actual_fraud_type}</span>
                                      </div>

                                      {/* Fraud Pattern Explanation */}
                                      <div className="mt-4 p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200">
                                        <div className="text-xs font-bold text-red-800 uppercase tracking-wide mb-2 flex items-center">
                                          <Shield className="w-3 h-3 mr-1" />
                                          Pattern Details
                                        </div>
                                        <p className="text-xs text-red-900 leading-relaxed">
                                          {prediction.actual_fraud_type === 'PHANTOM_BILLING' && (
                                            <>
                                              <strong>Phantom Billing:</strong> Services billed but never actually provided to the patient. This is detected through billing for services on dates when the patient had no visit, or billing for impossible combinations of procedures.
                                            </>
                                          )}
                                          {prediction.actual_fraud_type === 'UPCODING' && (
                                            <>
                                              <strong>Upcoding:</strong> Billing for more expensive services than what was actually provided. This involves using procedure codes for complex/expensive treatments when simpler, cheaper services were rendered.
                                            </>
                                          )}
                                          {prediction.actual_fraud_type === 'UNBUNDLING' && (
                                            <>
                                              <strong>Unbundling:</strong> Separating procedures that should be billed together into multiple claims to increase reimbursement. This is identified when related procedures are billed separately instead of using the appropriate bundled code.
                                            </>
                                          )}
                                          {prediction.actual_fraud_type === 'DUPLICATE_CLAIMS' && (
                                            <>
                                              <strong>Duplicate Claims:</strong> Submitting the same claim multiple times for a single service. This is detected through identical claim details (same provider, patient, date, and procedure) submitted more than once.
                                            </>
                                          )}
                                          {prediction.actual_fraud_type === 'EXCESSIVE_SERVICES' && (
                                            <>
                                              <strong>Excessive Services:</strong> Billing for medically unnecessary services or an unreasonable volume of services. This pattern shows significantly higher service frequency than medical standards recommend.
                                            </>
                                          )}
                                          {!['PHANTOM_BILLING', 'UPCODING', 'UNBUNDLING', 'DUPLICATE_CLAIMS', 'EXCESSIVE_SERVICES'].includes(prediction.actual_fraud_type) && (
                                            <>
                                              <strong>{prediction.actual_fraud_type}:</strong> Suspicious billing pattern detected. This claim exhibits characteristics that deviate from normal healthcare billing practices and requires detailed investigation.
                                            </>
                                          )}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* ML Risk Factors */}
                              {prediction.risk_factors && prediction.risk_factors.length > 0 && (
                                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                                  <h4 className="font-bold text-gray-900 mb-4 flex items-center text-base">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                                      <TrendingUp className="w-4 h-4 text-purple-600" />
                                    </div>
                                    Top Risk Factors
                                  </h4>
                                  <div className="space-y-3">
                                    {prediction.risk_factors.slice(0, 5).map((rf, idx) => (
                                      <div key={idx}>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="font-medium text-gray-700 truncate mr-2">{rf.factor}</span>
                                          <span className="font-bold text-gray-900">{rf.value.toFixed(3)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full transition-all ${
                                              rf.value > 0.7 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                              rf.value > 0.4 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                              'bg-gradient-to-r from-green-500 to-green-600'
                                            }`}
                                            style={{ width: `${Math.min(rf.value * 100, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Fraud Analysis */}
                              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center text-base">
                                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-2">
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                  </div>
                                  Analysis Summary
                                </h4>
                                {prediction.explanation?.summary ? (
                                  <div className="space-y-3">
                                    <p className="text-sm text-gray-700 leading-relaxed">{prediction.explanation.summary}</p>
                                    {prediction.explanation.red_flags && prediction.explanation.red_flags.length > 0 && (
                                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                        <div className="text-xs font-bold text-red-800 uppercase tracking-wide mb-2">Critical Red Flags</div>
                                        <ul className="space-y-1.5">
                                          {prediction.explanation.red_flags.slice(0, 3).map((flag: any, idx: number) => (
                                            <li key={idx} className="text-xs text-red-700 flex items-start">
                                              <span className="text-red-500 mr-1.5">⚠</span>
                                              <span>{flag.description || flag}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No detailed analysis available</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredAndSortedPredictions.length > 0 && (
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                      Show
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-semibold">
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedPredictions.length)}
                    </span>{' '}
                    of <span className="font-semibold">{filteredAndSortedPredictions.length}</span> results
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
