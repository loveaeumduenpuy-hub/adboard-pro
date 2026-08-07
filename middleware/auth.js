const jwt = require('jsonwebtoken');

// ตรวจ token ทุก request ที่เข้า API
function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'ไม่ได้ login' });

  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { id, email, role, name }
    next();
  } catch {
    res.status(401).json({ error: 'Token หมดอายุหรือไม่ถูกต้อง' });
  }
}

// ตรวจว่าเป็น admin เท่านั้น
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'ต้องเป็น Admin เท่านั้น' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
