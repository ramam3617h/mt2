const { createClient } = require('@supabase/supabase-js');

class TenantContextManager {
  constructor() {
    this.tenantCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000;
  }

  getSupabaseClient() {
    return createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async resolveTenantBySubdomain(subdomain) {
    const cacheKey = `subdomain:${subdomain}`;
    const cached = this.tenantCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.tenant;
    }

    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to resolve tenant: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    this.tenantCache.set(cacheKey, {
      tenant: data,
      timestamp: Date.now()
    });

    return data;
  }

  async resolveTenantById(tenantId) {
    const cacheKey = `id:${tenantId}`;
    const cached = this.tenantCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.tenant;
    }

    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to resolve tenant: ${error.message}`);
    }

    if (data) {
      this.tenantCache.set(cacheKey, {
        tenant: data,
        timestamp: Date.now()
      });
    }

    return data;
  }

  async getTenantConfigurations(tenantId) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tenant_configurations')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      throw new Error(`Failed to get configurations: ${error.message}`);
    }

    const configMap = {};
    data.forEach(config => {
      configMap[config.config_key] = config.config_value;
    });

    return configMap;
  }

  async getTenantUsers(tenantId) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tenant_users')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      throw new Error(`Failed to get tenant users: ${error.message}`);
    }

    return data;
  }

  async getUserTenants(userId) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tenant_users')
      .select('tenant_id, tenants(*)')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user tenants: ${error.message}`);
    }

    return data.map(item => item.tenants);
  }

  async createTenant(tenantData) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tenants')
      .insert([{
        name: tenantData.name,
        subdomain: tenantData.subdomain,
        status: tenantData.status || 'active',
        metadata: tenantData.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create tenant: ${error.message}`);
    }

    return data;
  }

  async updateTenant(tenantId, updates) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update tenant: ${error.message}`);
    }

    this.invalidateCache(tenantId);
    return data;
  }

  async setTenantConfiguration(tenantId, configKey, configValue) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tenant_configurations')
      .upsert([{
        tenant_id: tenantId,
        config_key: configKey,
        config_value: configValue
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to set configuration: ${error.message}`);
    }

    return data;
  }

  async addUserToTenant(tenantId, userData) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tenant_users')
      .insert([{
        tenant_id: tenantId,
        user_id: userData.user_id,
        email: userData.email,
        role: userData.role || 'user'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add user to tenant: ${error.message}`);
    }

    return data;
  }

  async removeUserFromTenant(tenantId, userId) {
    const supabase = this.getSupabaseClient();
    const { error } = await supabase
      .from('tenant_users')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove user from tenant: ${error.message}`);
    }

    return true;
  }

  invalidateCache(tenantId) {
    const keysToDelete = [];
    for (const [key, value] of this.tenantCache.entries()) {
      if (value.tenant && value.tenant.id === tenantId) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.tenantCache.delete(key));
  }

  clearCache() {
    this.tenantCache.clear();
  }
}

module.exports = new TenantContextManager();

