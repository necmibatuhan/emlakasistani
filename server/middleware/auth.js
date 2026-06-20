const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: 'Yetkisiz erişim. Lütfen giriş yapın.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, company_id, office_id, plan, created_at }

    // Check 14-day trial
    if (decoded.created_at && !['pro', 'premium', 'proplus', 'enterprise'].includes(decoded.plan)) {
      const createdDate = new Date(decoded.created_at);
      const now = new Date();
      const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 14) {
        return res.status(403).json({ message: '14 günlük deneme süreniz dolmuştur.', expired: true });
      }
    }

    next();
  } catch (err) {
    res.status(401).json({ message: `Geçersiz token: ${err.message}` });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole
};
