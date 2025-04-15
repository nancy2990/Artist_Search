const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const registerRoute = require('./routes/register');
const logoutRoute = require('./routes/logout');
const deleteAccountRoute = require('./routes/deleteAccount');
const meRoute = require('./routes/me');
const loginRoute = require('./routes/login');
const favoriteRoute = require('./routes/favorite');
const { getAccessToken } = require('./token');
const artistRoutes = require('./routes/artist');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const size = 10;
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/images', express.static('public/images'));
app.use('/api/register', registerRoute);
app.use('/api/logout', logoutRoute);
app.use('/api/delete-account', deleteAccountRoute);
app.use('/api/me', meRoute);
app.use('/api/login', loginRoute);
app.use('/api/favorite', favoriteRoute);
app.use('/api/artist', artistRoutes);
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));



// API to Search for Artists
app.get('/api/search', async (req, res) => {
  const artistName = req.query.q;
  if (!artistName) {
    return res.status(400).json({ error: 'Artist name is required' });
  }
  try {
    const accessToken = await getAccessToken();
    const artsy_url = `https://api.artsy.net/api/search?q=${encodeURIComponent(artistName)}&size=${size}&type=artist`;
    const response = await axios.get(artsy_url, {
      headers: {
        'X-Xapp-Token': accessToken
      }
      
    });
    console.log(accessToken);
    const results = response.data._embedded.results.map(result => {
      const name = result?.title ?? 'Unknown Artist';
      const artistId = result?._links?.self?.href?.match(/\/artists\/([^\/]+)$/)?.[1] ?? null;
      const image = result?._links?.thumbnail?.href ?? '';
    
      if (!artistId) {
        console.error(`Failed to extract artistId for artist: ${name}`);
      }
      return { name, image, artistId };
    });
    res.json(results);
  } catch (error) {
    console.error('Error fetching artist data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch artist data' });
  }
});
// API to details of artist
app.get('/api/artist/:id/artworks', async (req, res) => {
  const artistId = req.params.id;

  const artistUrl = `https://api.artsy.net/api/artists/${artistId}`;
  const artworksUrl = `https://api.artsy.net/api/artworks?artist_id=${artistId}&size=${size}`;
  try {
    const accessToken = await getAccessToken();
    const [artistResponse, artworksResponse] = await Promise.all([
      axios.get(artistUrl, { headers: { 'X-Xapp-Token': accessToken } }),
      axios.get(artworksUrl, { headers: { 'X-Xapp-Token': accessToken } })
    ]);

    const artistInfo = {
      artistId:artistResponse.data.id,
      name: artistResponse.data.name || '',
      birthday: artistResponse.data.birthday || '',
      deathday: artistResponse.data.deathday || '',
      nationality: artistResponse.data.nationality || '',
      biography: artistResponse.data.biography || ''
    };

    const artworks = artworksResponse.data._embedded.artworks.map((artwork) => ({
      id: artwork.id,
      title: artwork.title || '',
      date: artwork.date || '',
      image: artwork._links?.thumbnail?.href || ''
    }));

    return res.json({ artistInfo, artworks });
  } catch (error) {
    console.error('Error:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Artist or artworks not found.' });
    }

    return res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});

// API to Genes
app.get('/api/genes', async (req, res) => {
  const { artwork_id } = req.query;
  try {
    const accessToken = await getAccessToken();
    const genesUrl = `https://api.artsy.net/api/genes?artwork_id=${artwork_id}&size=${size}`;
    const response = await axios.get(genesUrl, {
      headers: { 'X-Xapp-Token': accessToken }
    });
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching genes:', error.message);
    res.status(500).json({ error: 'Error fetching genes' });
  }
});
const path = require('path');
frontendDistPath = path.join(__dirname, 'static', 'browser');

// // serve Angular build 
app.use('/', express.static(frontendDistPath));

app.get('/', (req, res) => {
  res.redirect('/search/artist');
});
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).send('API route not found');
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
module.exports = app;