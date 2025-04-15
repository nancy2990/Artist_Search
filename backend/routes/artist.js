const express = require('express');
const axios = require('axios');
const router = express.Router();
const { getAccessToken } = require('../token');

const ARTSY_API_BASE = 'https://api.artsy.net/api';
router.get('/:id/similar', async (req, res) => {
  const artistId = req.params.id;

  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(`${ARTSY_API_BASE}/artists`, {
      params: {
        similar_to_artist_id: artistId,
        size: 10
      },
      headers: {
        'X-Xapp-Token': accessToken
      }
    });

    const artists = response.data._embedded.artists.map(a => ({
      artistId: a.id,
      name: a.name,
      image: a._links.thumbnail?.href || ''
    }));
    res.json(artists);
  } catch (error) {
    console.error('Error fetching similar artists:', error.message);
    res.status(500).json({ error: 'Failed to fetch similar artists' });
  }
});

module.exports = router;
