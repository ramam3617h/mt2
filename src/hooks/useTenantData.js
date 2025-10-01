import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTenant } from '../contexts/TenantContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useTenantData(dataType = null) {
  const { tenant } = useTenant();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!tenant) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('tenant_data')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (dataType) {
        query = query.eq('data_type', dataType);
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setData(fetchedData || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load tenant data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createData = async (dataType, dataContent) => {
    try {
      const { data: newData, error: createError } = await supabase
        .from('tenant_data')
        .insert([{
          tenant_id: tenant.id,
          data_type: dataType,
          data_content: dataContent
        }])
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      setData(prev => [...prev, newData]);
      return newData;
    } catch (err) {
      console.error('Failed to create data:', err);
      throw err;
    }
  };

  const updateData = async (id, updates) => {
    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('tenant_data')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenant.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      setData(prev => prev.map(item => item.id === id ? updatedData : item));
      return updatedData;
    } catch (err) {
      console.error('Failed to update data:', err);
      throw err;
    }
  };

  const deleteData = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('tenant_data')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenant.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete data:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant, dataType]);

  return {
    data,
    loading,
    error,
    loadData,
    createData,
    updateData,
    deleteData
  };
}
