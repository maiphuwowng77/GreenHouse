const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

function authMiddleware(req, res, next) {
  const token = req.header('Authorization');
  if (!token || token == undefined) {
    return res.status(403).send('Access denied');
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(403).send('Invalid token');
  }
}

module.exports = authMiddleware;
