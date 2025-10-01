const express = require('express');
const tenantContextManager = require('../services/TenantContextManager');
const { requireTenantContext } = require('../middleware/tenantResolver');

const router = express.Router();

router.get('/current', requireTenantContext, async (req, res) => {
  try {
    res.json({
      success: true,
      tenant: req.tenant
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get tenant information',
      message: error.message
    });
  }
});

router.get('/configurations', requireTenantContext, async (req, res) => {
  try {
    const configurations = await tenantContextManager.getTenantConfigurations(req.tenantId);
    res.json({
      success: true,
      configurations
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get configurations',
      message: error.message
    });
  }
});

router.post('/configurations', requireTenantContext, async (req, res) => {
  try {
    const { configKey, configValue } = req.body;

    if (!configKey) {
      return res.status(400).json({
        error: 'Config key is required'
      });
    }

    const config = await tenantContextManager.setTenantConfiguration(
      req.tenantId,
      configKey,
      configValue
    );

    res.json({
      success: true,
      configuration: config
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to set configuration',
      message: error.message
    });
  }
});

router.get('/users', requireTenantContext, async (req, res) => {
  try {
    const users = await tenantContextManager.getTenantUsers(req.tenantId);
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get users',
      message: error.message
    });
  }
});

router.post('/users', requireTenantContext, async (req, res) => {
  try {
    const { user_id, email, role } = req.body;

    if (!user_id || !email) {
      return res.status(400).json({
        error: 'User ID and email are required'
      });
    }

    const user = await tenantContextManager.addUserToTenant(req.tenantId, {
      user_id,
      email,
      role: role || 'user'
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to add user',
      message: error.message
    });
  }
});

router.delete('/users/:userId', requireTenantContext, async (req, res) => {
  try {
    const { userId } = req.params;

    await tenantContextManager.removeUserFromTenant(req.tenantId, userId);

    res.json({
      success: true,
      message: 'User removed from tenant'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to remove user',
      message: error.message
    });
  }
});

router.put('/', requireTenantContext, async (req, res) => {
  try {
    const updates = req.body;

    delete updates.id;
    delete updates.subdomain;

    const updatedTenant = await tenantContextManager.updateTenant(
      req.tenantId,
      updates
    );

    res.json({
      success: true,
      tenant: updatedTenant
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update tenant',
      message: error.message
    });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { name, subdomain, metadata } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({
        error: 'Name and subdomain are required'
      });
    }

    const tenant = await tenantContextManager.createTenant({
      name,
      subdomain,
      metadata: metadata || {}
    });

    res.json({
      success: true,
      tenant
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create tenant',
      message: error.message
    });
  }
});

module.exports = router;
