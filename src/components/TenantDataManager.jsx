import { useState } from 'react';
import { useTenantData } from '../hooks/useTenantData';
import { Plus, Trash2, CreditCard as Edit2, Save, X, Loader } from 'lucide-react';

export function TenantDataManager() {
  const { data, loading, error, createData, updateData, deleteData } = useTenantData();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ dataType: '', dataContent: {} });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createData(formData.dataType, formData.dataContent);
      setFormData({ dataType: '', dataContent: {} });
      setIsCreating(false);
    } catch (err) {
      alert(`Failed to create data: ${err.message}`);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateData(id, {
        data_type: formData.dataType,
        data_content: formData.dataContent
      });
      setEditingId(null);
      setFormData({ dataType: '', dataContent: {} });
    } catch (err) {
      alert(`Failed to update data: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this data?')) {
      try {
        await deleteData(id);
      } catch (err) {
        alert(`Failed to delete data: ${err.message}`);
      }
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      dataType: item.data_type,
      dataContent: item.data_content
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ dataType: '', dataContent: {} });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tenant Data</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Data
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Type
            </label>
            <input
              type="text"
              value={formData.dataType}
              onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Content (JSON)
            </label>
            <textarea
              value={JSON.stringify(formData.dataContent, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, dataContent: JSON.parse(e.target.value) });
                } catch (err) {
                  console.error('Invalid JSON');
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows="4"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setFormData({ dataType: '', dataContent: {} });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
            No data found. Click "Add Data" to create your first entry.
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className="p-4 bg-white border border-gray-200 rounded-lg">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Type
                    </label>
                    <input
                      type="text"
                      value={formData.dataType}
                      onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Content (JSON)
                    </label>
                    <textarea
                      value={JSON.stringify(formData.dataContent, null, 2)}
                      onChange={(e) => {
                        try {
                          setFormData({ ...formData, dataContent: JSON.parse(e.target.value) });
                        } catch (err) {
                          console.error('Invalid JSON');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      rows="4"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(item.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {item.data_type}
                        </span>
                      </div>
                      <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto">
                        {JSON.stringify(item.data_content, null, 2)}
                      </pre>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
