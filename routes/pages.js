const express  = require('express');
const supabase = require('../middleware/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/pages
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('pages').select('*').order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/pages
router.post('/', requireAdmin, async (req, res) => {
  const { name, color } = req.body;
  const { data, error } = await supabase.from('pages').insert({ name, color }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/pages/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('pages').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
