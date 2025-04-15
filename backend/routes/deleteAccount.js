const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

router.delete('/', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.clearCookie('token');
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;