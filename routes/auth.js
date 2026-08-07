const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const supabase = require('../middleware/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'กรอก email และ password ด้วย' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !user)
    return res.status(401).json({ error: 'ไม่พบ account นี้' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    return res.status(401).json({ error: 'Password ไม่ถูกต้อง' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

// GET /api/auth/me — ตรวจว่า token ยังใช้ได้ไหม
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/users — admin สร้าง account ลูกน้อง
router.post('/users', requireAuth, requireAdmin, async (req, res) => {
  const { email, password, name, role = 'staff' } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: 'กรอก email, password, name ด้วย' });

  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({ email: email.toLowerCase().trim(), password_hash: hash, name, role })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: { id: data.id, email: data.email, name: data.name, role: data.role } });
});

// GET /api/auth/users — admin ดูรายชื่อทีม
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, created_at')
    .order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/auth/users/:id — admin ลบ account
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabase.from('users').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// POST /api/auth/set-password — admin ตั้ง password ครั้งแรก (แทน CHANGE_THIS_LATER)
router.post('/set-password', async (req, res) => {
  const { email, old_password, new_password } = req.body;
  if (!email || !new_password)
    return res.status(400).json({ error: 'กรอก email และ new_password' });

  const { data: user } = await supabase
    .from('users')
    .select('*').eq('email', email).single();

  if (!user) return res.status(404).json({ error: 'ไม่พบ account' });

  // ถ้า password_hash ยังเป็น placeholder ให้ตั้งใหม่ได้เลย
  const isPlaceholder = user.password_hash === 'CHANGE_THIS_LATER';
  if (!isPlaceholder) {
    const valid = await bcrypt.compare(old_password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Password เดิมไม่ถูก' });
  }

  const hash = await bcrypt.hash(new_password, 10);
  await supabase.from('users').update({ password_hash: hash }).eq('id', user.id);
  res.json({ ok: true });
});

module.exports = router;
