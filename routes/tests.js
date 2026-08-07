const express  = require('express');
const supabase = require('../middleware/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/tests?start=&end=
router.get('/', async (req, res) => {
  const { start, end } = req.query;
  let q = supabase.from('tests').select('*').order('date', { ascending: false });
  if (req.user.role !== 'admin') q = q.eq('created_by', req.user.id);
  if (start) q = q.gte('date', start);
  if (end)   q = q.lte('date', end);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/tests
router.post('/', async (req, res) => {
  const { date, name, amount } = req.body;
  const { data, error } = await supabase
    .from('tests')
    .insert({ date, name, amount, created_by: req.user.id })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/tests/:id
router.delete('/:id', async (req, res) => {
  let q = supabase.from('tests').delete().eq('id', req.params.id);
  if (req.user.role !== 'admin') q = q.eq('created_by', req.user.id);
  const { error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
