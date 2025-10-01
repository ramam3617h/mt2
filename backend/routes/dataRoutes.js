const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { requireTenantContext } = require('../middleware/tenantResolver');

const router = express.Router();

function getSupabaseClient() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
}

router.get('/', requireTenantContext, async (req, res) => {
  try {
    const { dataType } = req.query;
    const supabase = getSupabaseClient();

    let query = supabase
      .from('tenant_data')
      .select('*')
      .eq('tenant_id', req.tenantId);

    if (dataType) {
      query = query.eq('data_type', dataType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get data',
      message: error.message
    });
  }
});

router.post('/', requireTenantContext, async (req, res) => {
  try {
    const { dataType, dataContent } = req.body;

    if (!dataType || !dataContent) {
      return res.status(400).json({
        error: 'Data type and content are required'
      });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('tenant_data')
      .insert([{
        tenant_id: req.tenantId,
        data_type: dataType,
        data_content: dataContent
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create data',
      message: error.message
    });
  }
});

router.put('/:id', requireTenantContext, async (req, res) => {
  try {
    const { id } = req.params;
    const { dataType, dataContent } = req.body;

    const updates = {};
    if (dataType) updates.data_type = dataType;
    if (dataContent) updates.data_content = dataContent;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('tenant_data')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', req.tenantId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return res.status(404).json({
        error: 'Data not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update data',
      message: error.message
    });
  }
});

router.delete('/:id', requireTenantContext, async (req, res) => {
  try {
    const { id } = req.params;

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('tenant_data')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.tenantId);

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      success: true,
      message: 'Data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete data',
      message: error.message
    });
  }
});

module.exports = router;
