const express = require('express');
const cors = require('cors');
const { getProfile, saveProfile } = require('../../server/routes/profile');

const app = express();
app.use(cors());
app.use(express.json());

// Profile routes
app.get('/api/profile/:userId', getProfile);
app.post('/api/profile/:userId', saveProfile);

// Handle all other routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports.handler = require('serverless-http')(app);