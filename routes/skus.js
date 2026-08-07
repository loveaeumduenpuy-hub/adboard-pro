const express  = require('express');
const supabase = require('../middleware/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/skus — ทุกคนดูได้ (ต้องรู้ว่าสินค้ามีอะไรเพื่อกรอกยอด)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('skus').select('*').order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/skus — admin เพิ่ม SKU
router.post('/', requireAdmin, async (req, res) => {
  const { page_id, name, pieces, price, cost, ship, pack, admin_fee, cod_pct } = req.body;
  const { data, error } = await supabase
    .from('skus')
    .insert({ page_id, name, pieces, price, cost, ship, pack, admin_fee, cod_pct })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// PUT /api/skus/:id — admin แก้ไข SKU
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, pieces, price, cost, ship, pack, admin_fee, cod_pct } = req.body;
  const { data, error } = await supabase
    .from('skus').update({ name, pieces, price, cost, ship, pack, admin_fee, cod_pct })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/skus/:id — admin ลบ SKU
router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('skus').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
