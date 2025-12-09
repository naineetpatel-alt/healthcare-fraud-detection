import { useEffect } from 'react';
import { useDatasetStore } from '../../dataset/store/datasetStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function FraudStatisticsChart() {
  const { stats, fetchStats } = useDatasetStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const barData = [
    {
      name: 'Total Claims',
      Legitimate: stats.total_claims - stats.total_fraudulent_claims,
      Fraudulent: stats.total_fraudulent_claims,
    },
  ];

  const pieData = [
    { name: 'Legitimate', value: stats.total_claims - stats.total_fraudulent_claims },
    { name: 'Fraudulent', value: stats.total_fraudulent_claims },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  const amountData = [
    {
      name: 'Claim Amounts',
      'Legitimate Amount': stats.total_claim_amount - stats.fraud_amount,
      'Fraud Amount': stats.fraud_amount,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Claims Count */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Claims Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="Legitimate" fill="#10b981" />
              <Bar dataKey="Fraudulent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Total: {stats.total_claims.toLocaleString()} claims
            ({(stats.fraud_rate * 100).toFixed(1)}% fraud rate)
          </div>
        </div>

        {/* Pie Chart - Claims Percentage */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fraud vs Legitimate Claims
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {(stats.total_claims - stats.total_fraudulent_claims).toLocaleString()}
              </div>
              <div className="text-gray-600">Legitimate</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">
                {stats.total_fraudulent_claims.toLocaleString()}
              </div>
              <div className="text-gray-600">Fraudulent</div>
            </div>
          </div>
        </div>

        {/* Bar Chart - Amount Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Impact
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={amountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Legitimate Amount" fill="#10b981" />
              <Bar dataKey="Fraud Amount" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Total Claims: ${(stats.total_claim_amount / 1000000).toFixed(2)}M
            | Fraud Loss: ${(stats.fraud_amount / 1000000).toFixed(2)}M
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Key Metrics
          </h3>
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Claim Amount</span>
                <span className="font-semibold text-gray-900">
                  ${(stats.total_claim_amount / stats.total_claims).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="border-b border-gray-200 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Fraud Amount</span>
                <span className="font-semibold text-red-600">
                  ${(stats.fraud_amount / stats.total_fraudulent_claims).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="border-b border-gray-200 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Claims per Patient</span>
                <span className="font-semibold text-gray-900">
                  {(stats.total_claims / stats.total_patients).toFixed(1)}
                </span>
              </div>
            </div>
            <div className="border-b border-gray-200 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Claims per Provider</span>
                <span className="font-semibold text-gray-900">
                  {(stats.total_claims / stats.total_providers).toFixed(1)}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Fraud Detection Rate</span>
                <span className="font-bold text-indigo-600 text-lg">
                  {(stats.fraud_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
