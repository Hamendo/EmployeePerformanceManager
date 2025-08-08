// server/middleware/adminAuth.js
const dotenv = require('dotenv');
dotenv.config();

const adminAuth = (req, res, next) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    return next();
  } else {
    return res.status(401).json({ message: 'Unauthorized: Invalid admin password' });
  }
};

module.exports = adminAuth;
