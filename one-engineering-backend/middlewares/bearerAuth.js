// middlewares/bearerAuth.js
// One Engineering — Bearer Token Auth Middleware
//
// The cookie-based authMiddleware works for the OE React app (credentials:include).
// This middleware is for cross-origin tool calls (e.g. Nexus frontend) that
// send the token as a Bearer header instead of a cookie.
// Both use the same JWT_SECRET_KEY.

const jwt = require('jsonwebtoken');
require('dotenv').config();

const bearerAuthMiddleware = (req, res, next) => {
  // First try Bearer header (cross-tool usage: Nexus, etc.)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }

  // Fall back to cookie (OE React app)
  const cookieToken = req.cookies?.token;
  if (cookieToken) {
    try {
      const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }

  return res.status(401).json({ success: false, message: 'Please login first' });
};

module.exports = bearerAuthMiddleware;
