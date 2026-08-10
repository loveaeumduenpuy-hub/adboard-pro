const express  = require('express');
const supabase = require('../middleware/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { team_id } = req.query;
  if (team_id) {
    const { data: pages } = await supabase.from('pages').select('id').eq('team_id', team_id);
    const pageIds = (pages||[]).map(p=>p.id);
    if (!pageIds.length) return res.json([]);
    const { data, error } = await supabase.from('skus').select('*').in('page_id', pageIds).order('created_at');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  const { data, error } = await supabase.from('skus').select('*').order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
router.post('/', requireAdmin, async (req, res) => {
  const { page_id, name, pieces, price, cost, ship, pack, admin_fee, cod_pct, team_id } = req.body;
  const { data, error } = await supabase.from('skus')
    .insert({ page_id, name, pieces, price, cost, ship, pack, admin_fee, cod_pct, team_id }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, pieces, price, cost, ship, pack, admin_fee, cod_pct } = req.body;
  const { data, error } = await supabase.from('skus')
    .update({ name, pieces, price, cost, ship, pack, admin_fee, cod_pct }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});
router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('skus').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});
module.exports = router;
