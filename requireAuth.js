// Middleware to protect routes — checks if user is logged in via session
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
  }
  next();
}

module.exports = requireAuth;
