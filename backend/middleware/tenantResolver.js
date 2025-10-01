const tenantContextManager = require('../services/TenantContextManager');

function parseSubdomainFromHost(host) {
  if (!host) {
    return null;
  }

  const parts = host.split('.');

  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

function parseSubdomainFromHeader(req) {
  const tenantHeader = req.headers['x-tenant-subdomain'];
  if (tenantHeader) {
    return tenantHeader;
  }
  return null;
}

async function tenantResolverMiddleware(req, res, next) {
  try {
    let subdomain = parseSubdomainFromHeader(req);

    if (!subdomain) {
      const host = req.get('host');
      subdomain = parseSubdomainFromHost(host);
    }

    if (!subdomain) {
      return res.status(400).json({
        error: 'Tenant context could not be resolved',
        message: 'No subdomain found in request'
      });
    }

    const tenant = await tenantContextManager.resolveTenantBySubdomain(subdomain);

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `No active tenant found for subdomain: ${subdomain}`
      });
    }

    if (tenant.status !== 'active') {
      return res.status(403).json({
        error: 'Tenant suspended',
        message: 'This tenant account is not active'
      });
    }

    req.tenant = tenant;
    req.tenantId = tenant.id;

    next();
  } catch (error) {
    console.error('Tenant resolution error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to resolve tenant context'
    });
  }
}

async function optionalTenantResolver(req, res, next) {
  try {
    let subdomain = parseSubdomainFromHeader(req);

    if (!subdomain) {
      const host = req.get('host');
      subdomain = parseSubdomainFromHost(host);
    }

    if (subdomain) {
      const tenant = await tenantContextManager.resolveTenantBySubdomain(subdomain);
      if (tenant && tenant.status === 'active') {
        req.tenant = tenant;
        req.tenantId = tenant.id;
      }
    }

    next();
  } catch (error) {
    console.error('Optional tenant resolution error:', error);
    next();
  }
}

function requireTenantContext(req, res, next) {
  if (!req.tenant || !req.tenantId) {
    return res.status(400).json({
      error: 'Tenant context required',
      message: 'This endpoint requires a valid tenant context'
    });
  }
  next();
}

module.exports = {
  tenantResolverMiddleware,
  optionalTenantResolver,
  requireTenantContext,
  parseSubdomainFromHost,
  parseSubdomainFromHeader
};
