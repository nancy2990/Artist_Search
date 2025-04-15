const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');
const { getAccessToken, getCurrentToken } = require('../token');
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { artistId } = req.body;

    if (!artistId) {
      return res.status(400).json({ message: 'artistId is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const alreadyFavorited = user.favorite.some(f => f.artistId === artistId);
    if (alreadyFavorited) {
      return res.status(400).json({ message: 'Artist already in favorites.' });
    }

    user.favorite.push({ artistId, addedAt: new Date() });
    await user.save();

    return res.status(200).json({ message: 'Artist added to favorites.' });
  } catch (err) {
    console.error('Add to favorites error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

router.delete('/:artistId', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { artistId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.favorite = user.favorite.filter(f => f.artistId !== artistId);
    await user.save();

    return res.status(200).json({ message: 'Artist removed from favorites.' });
  } catch (err) {
    console.error('Remove from favorites error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const sortedFavorites = user.favorite.sort((a, b) => b.addedAt - a.addedAt);

    const favoritesFullInfo = await Promise.all(
      sortedFavorites.map(async fav => {
        try {
          const token = await getAccessToken();
          const artistResponse = await axios.get(`https://api.artsy.net/api/artists/${fav.artistId}`, {
            headers: { 'X-Xapp-Token': token }
          });
          const favInfo = {
            artistId:artistResponse.data.id,
            name: artistResponse.data.name || '',
            image:artistResponse.data._links?.thumbnail?.href || '',
            birthday: artistResponse.data.birthday || '',
            deathday: artistResponse.data.deathday || '',
            nationality: artistResponse.data.nationality || '',
            addedAt:fav.addedAt
          };
          console.log(favInfo)
          return favInfo;
        } catch (apiError) {
          console.error(`Error fetching artist ${fav.artistId}:`, apiError.message);
          return {
            artistId: fav.artistId,
            addedAt: fav.addedAt,
            error: 'Failed to fetch artist details'
          };
        }
      })
    );

    return res.status(200).json(favoritesFullInfo);
  } catch (err) {
    console.error('Get favorites error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
