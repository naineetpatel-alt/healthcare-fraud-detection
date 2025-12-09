import { useState } from 'react';
import PatientsTable from './PatientsTable';
import ProvidersTable from './ProvidersTable';
import ClaimsTable from './ClaimsTable';
import { Users, Building2, FileText } from 'lucide-react';

type ViewType = 'patients' | 'providers' | 'claims';

export default function DatasetViewer() {
  const [activeView, setActiveView] = useState<ViewType>('claims');

  const views = [
    { id: 'patients' as ViewType, name: 'Patients', icon: Users },
    { id: 'providers' as ViewType, name: 'Providers', icon: Building2 },
    { id: 'claims' as ViewType, name: 'Claims', icon: FileText },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dataset Explorer</h2>
        <p className="text-gray-600">
          Browse patients, providers, and insurance claims in the system
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`${
                  activeView === view.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {view.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeView === 'patients' && <PatientsTable />}
        {activeView === 'providers' && <ProvidersTable />}
        {activeView === 'claims' && <ClaimsTable pageSize={20} />}
      </div>
    </div>
  );
}
