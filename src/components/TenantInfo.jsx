import { useTenant } from '../contexts/TenantContext';
import { Building2, CheckCircle, XCircle, Loader } from 'lucide-react';

export function TenantInfo() {
  const { tenant, loading, error } = useTenant();

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Loader className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-blue-800">Loading tenant information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="w-5 h-5 text-red-600" />
        <div>
          <p className="font-medium text-red-800">Failed to load tenant</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <XCircle className="w-5 h-5 text-gray-600" />
        <span className="text-gray-800">No tenant found</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-gray-900">{tenant.name}</h2>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Subdomain:</span> {tenant.subdomain}
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                tenant.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {tenant.status}
              </span>
            </p>
            <p>
              <span className="font-medium">Tenant ID:</span> {tenant.id}
            </p>
            <p>
              <span className="font-medium">Created:</span>{' '}
              {new Date(tenant.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
