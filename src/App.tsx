import { TenantProvider } from './contexts/TenantContext';
import { TenantInfo } from './components/TenantInfo';
import { TenantDataManager } from './components/TenantDataManager';
import { Database } from 'lucide-react';

function App() {
  return (
    <TenantProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Multitenant Application
              </h1>
            </div>
            <p className="text-gray-600">
              Database-level tenant isolation with row-level security
            </p>
          </div>

          <div className="space-y-6">
            <TenantInfo />
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <TenantDataManager /> 
            </div>
          </div>
        </div>
      </div>
    </TenantProvider>
  );
}

export default App;
