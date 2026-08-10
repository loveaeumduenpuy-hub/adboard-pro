const express  = require('express');
const supabase = require('../middleware/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/pages — ทุกคนดูได้
router.get('/', async (req, res) => {
  const { team_id } = req.query;
  let q = supabase.from('pages').select('*').order('created_at');
  if (team_id) q = q.eq('team_id', team_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/pages — admin เพิ่มเพจ
router.post('/', requireAdmin, async (req, res) => {
  const { name, color } = req.body;
  const { data, error } = await supabase.from('pages').insert({ name, color }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/pages/:id — admin ลบเพจ
router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('pages').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
