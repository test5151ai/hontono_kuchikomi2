const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '管理者権限が必要です' });
  }
  next();
};

module.exports = { isAdmin }; 