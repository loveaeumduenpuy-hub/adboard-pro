const express  = require('express');
const supabase = require('../middleware/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/teams — admin เห็นทุกทีม, staff เห็นเฉพาะทีมตัวเอง
router.get('/', async (req, res) => {
  if (req.user.role === 'admin') {
    const { data, error } = await supabase.from('teams').select('*').order('created_at');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  // staff — เอาเฉพาะทีมที่ตัวเองอยู่
  const { data, error } = await supabase
    .from('team_members')
    .select('teams(*)')
    .eq('user_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(d => d.teams).filter(Boolean));
});

// POST /api/teams — admin เท่านั้น
router.post('/', requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'ใส่ชื่อทีมด้วย' });
  const { data, error } = await supabase.from('teams').insert({ name }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/teams/:id — admin เท่านั้น
router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('teams').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// GET /api/teams/members — admin เห็นทั้งหมด
router.get('/members', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/teams/members — admin เพิ่มสมาชิก
router.post('/members', requireAdmin, async (req, res) => {
  const { team_id, user_id } = req.body;
  if (!team_id || !user_id) return res.status(400).json({ error: 'ระบุ team_id และ user_id' });
  const { data, error } = await supabase
    .from('team_members')
    .insert({ team_id, user_id })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/teams/members/:id — admin ลบสมาชิก
router.delete('/members/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('team_members').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
