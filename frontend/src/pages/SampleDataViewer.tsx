import { useState, useEffect } from 'react';
import { ArrowLeft, Play, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.config';
import toast from 'react-hot-toast';

export default function SampleDataViewer() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, claimsRes] = await Promise.all([
        api.get('/dataset/stats'),
        api.get(`/dataset/claims?page=${page}&page_size=${pageSize}`)
      ]);
      setStats(statsRes.data);
      setClaims(claimsRes.data.claims || []);
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = () => {
    navigate('/analysis');
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Sample Dataset</h1>
                <p className="text-sm text-gray-600">Preview healthcare claims data</p>
              </div>
            </div>
            <button
              onClick={handleRunAnalysis}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Run Fraud Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Claims</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_claims?.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">Patients</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_patients?.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">Providers</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_providers?.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">Fraud Cases</div>
              <div className="text-3xl font-bold text-red-600">{stats.fraud_claims?.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">
                {((stats.fraud_claims / stats.total_claims) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>
        )}

        {/* Claims Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Claims</h2>
            <button
              onClick={() => loadData()}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading claims data...
                    </td>
                  </tr>
                ) : claims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  claims.map((claim: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {claim.claim_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {claim.patient_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {claim.provider_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${claim.claim_amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(claim.service_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {claim.claim_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {claim.actual_fraud_label ? (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Fraud
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={claims.length < pageSize}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
