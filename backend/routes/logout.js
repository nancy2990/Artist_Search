const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;