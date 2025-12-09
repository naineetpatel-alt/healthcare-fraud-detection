import { useEffect } from 'react';
import { useDatasetStore } from '../store/datasetStore';
import StatCard from '../../../components/ui/StatCard';
import { Users, Building2, FileText } from 'lucide-react';

export default function DatasetOverview() {
  const { stats, isLoading, error, fetchStats } = useDatasetStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading statistics: {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const totalAmountFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(stats.total_claim_amount);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dataset Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.total_patients.toLocaleString()}
          subtitle="Registered in system"
          icon={<Users className="w-6 h-6" />}
        />

        <StatCard
          title="Healthcare Providers"
          value={stats.total_providers.toLocaleString()}
          subtitle="Active providers"
          icon={<Building2 className="w-6 h-6" />}
        />

        <StatCard
          title="Total Claims"
          value={stats.total_claims.toLocaleString()}
          subtitle={totalAmountFormatted}
          icon={<FileText className="w-6 h-6" />}
        />
      </div>

      {/* Additional Stats Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Claims per Patient</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {(stats.total_claims / stats.total_patients).toFixed(1)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Claim Amount</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(stats.total_claim_amount / stats.total_claims)}
          </p>
        </div>
      </div>
    </div>
  );
}
