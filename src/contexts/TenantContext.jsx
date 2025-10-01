import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const TenantContext = createContext(null);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getSubdomainFromHost = () => {
    const host = window.location.host;
    const parts = host.split('.');

    if (parts.length >= 3) {
      return parts[0];
    }

    return null;
  };

  const loadTenant = async (subdomain) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', subdomain)
        .eq('status', 'active')
        .maybeSingle();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data) {
        throw new Error(`No active tenant found for subdomain: ${subdomain}`);
      }

      setTenant(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTenantConfigurations = async (tenantId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tenant_configurations')
        .select('*')
        .eq('tenant_id', tenantId);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const configMap = {};
      data.forEach(config => {
        configMap[config.config_key] = config.config_value;
      });

      return configMap;
    } catch (err) {
      console.error('Failed to load configurations:', err);
      return {};
    }
  };

  const updateTenant = async (updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', tenant.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      setTenant(data);
      return data;
    } catch (err) {
      console.error('Failed to update tenant:', err);
      throw err;
    }
  };

  const setConfiguration = async (configKey, configValue) => {
    try {
      const { data, error: configError } = await supabase
        .from('tenant_configurations')
        .upsert([{
          tenant_id: tenant.id,
          config_key: configKey,
          config_value: configValue
        }])
        .select()
        .single();

      if (configError) {
        throw new Error(configError.message);
      }

      return data;
    } catch (err) {
      console.error('Failed to set configuration:', err);
      throw err;
    }
  };

  useEffect(() => {
    const subdomain = getSubdomainFromHost();

    if (subdomain) {
      loadTenant(subdomain);
    } else {
      setLoading(false);
      setError('No subdomain detected');
    }
  }, []);

  const value = {
    tenant,
    loading,
    error,
    loadTenant,
    loadTenantConfigurations,
    updateTenant,
    setConfiguration,
    getSubdomain: getSubdomainFromHost
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
