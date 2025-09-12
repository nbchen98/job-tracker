const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and extract user ID
function verifyToken(req, res, next) {
  console.log('🔍 verifyToken called');
  console.log('📋 All headers:', req.headers);
  console.log('🔑 Authorization header:', req.headers['authorization']);
  
  const token = req.headers['authorization'];
  if (!token) {
    console.log('❌ No token found');
    return res.sendStatus(401);
  }
  
  // Remove 'Bearer ' prefix if present in order to verify JWT token
  const cleanToken = token.replace('Bearer ', '');
  console.log('🧹 Clean token:', cleanToken);
  
  jwt.verify(cleanToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ JWT verification failed:', err.message);
      return res.sendStatus(403);
    }
    console.log('✅ JWT verified successfully, user:', user);
    req.user = user;
    next();
  });
}

module.exports = { verifyToken };
