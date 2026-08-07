const express  = require('express');
const supabase = require('../middleware/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/returns?month=
router.get('/', async (req, res) => {
  const { month } = req.query;
  let q = supabase.from('returns').select('*, pages(name)').order('month', { ascending: false });
  if (month) q = q.eq('month', month);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/returns — admin เท่านั้น
router.post('/', requireAdmin, async (req, res) => {
  const { month, page_id, return_orders, cost_per_return } = req.body;
  const { data, error } = await supabase
    .from('returns')
    .insert({ month, page_id, return_orders, cost_per_return })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/returns/:id — admin เท่านั้น
router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('returns').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
