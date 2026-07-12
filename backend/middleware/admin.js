function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ только для администраторов' });
  }
  next();
}

module.exports = adminMiddleware;