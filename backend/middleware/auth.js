const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and extract user ID
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    console.log('❌ No token found');
    return res.sendStatus(401);
  }
  
  // Remove 'Bearer ' prefix if present in order to verify JWT token
  const cleanToken = token.replace('Bearer ', '');

  jwt.verify(cleanToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ JWT verification failed:', err.message);
      return res.sendStatus(401); // The frontend logs out on 401, so an expired token must return this
    }
    req.user = user;
    next();
  });
}

module.exports = { verifyToken };
