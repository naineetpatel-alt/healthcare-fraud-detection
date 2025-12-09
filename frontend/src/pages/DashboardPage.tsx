import { useState } from 'react';
import { useAuthStore } from '../features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import DatasetOverview from '../features/dataset/components/DatasetOverview';
import ClaimsTable from '../features/dataset/components/ClaimsTable';
import DatasetViewer from '../features/dataset/components/DatasetViewer';
import FraudDetectionPanel from '../features/fraud-detection/components/FraudDetectionPanel';
import AnalyticsDashboard from '../features/visualizations/components/AnalyticsDashboard';
import { LayoutDashboard, Database, Shield, BarChart3 } from 'lucide-react';

type TabType = 'overview' | 'dataset' | 'detection' | 'analytics';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: LayoutDashboard },
    { id: 'dataset' as TabType, name: 'Dataset', icon: Database },
    { id: 'detection' as TabType, name: 'Fraud Detection', icon: Shield },
    { id: 'analytics' as TabType, name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Health Insurance Fraud Detection
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.username || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <DatasetOverview />

            <div className="bg-white rounded-lg shadow p-6">
              <ClaimsTable fraudOnly={true} pageSize={5} />
            </div>
          </div>
        )}

        {activeTab === 'dataset' && (
          <div className="bg-white rounded-lg shadow p-6">
            <DatasetViewer />
          </div>
        )}

        {activeTab === 'detection' && (
          <div className="bg-white rounded-lg shadow p-6">
            <FraudDetectionPanel />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <AnalyticsDashboard />
          </div>
        )}
      </main>
    </div>
  );
}
