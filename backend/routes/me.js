const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('fullname profileImageUrl favorite');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const sortedFavorites = user.favorite.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    console.log(sortedFavorites);
    return res.status(200).json({
      fullname: user.fullname,
      profileImageUrl: user.profileImageUrl,
      favorite: sortedFavorites,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;