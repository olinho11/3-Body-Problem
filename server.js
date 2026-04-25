const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

const dataFile = process.env.DATA_FILE || path.join(__dirname, 'data.json');

function loadData() {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify({ users: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (err) {
    console.error('Failed to read data file:', err);
    return { users: {} };
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function getUserId(req, res) {
  let userId = req.cookies.userId;
  if (!userId) {
    userId = crypto.randomUUID();
    res.cookie('userId', userId, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }
  return userId;
}

app.post('/save-scenario', (req, res) => {
  const userId = getUserId(req, res);
  const { bodyState, physics, presetName } = req.body;
  if (!bodyState || !physics) {
    return res.status(400).json({ error: 'Missing scenario data.' });
  }
  const data = loadData();
  const user = data.users[userId] || {};
  data.users[userId] = {
    ...user,
    savedScenario: { bodyState, physics, presetName, timestamp: Date.now() },
  };
  saveData(data);
  res.json({ success: true });
});

app.get('/load-scenario', (req, res) => {
  const userId = getUserId(req, res);
  const data = loadData();
  const user = data.users[userId] || {};
  if (!user.savedScenario) {
    return res.status(404).json({ error: 'No saved scenario found.' });
  }
  res.json({ scenario: user.savedScenario });
});

app.get('/saved-presets', (req, res) => {
  const userId = getUserId(req, res);
  const data = loadData();
  const user = data.users[userId] || {};
  const presets = Array.isArray(user.savedPresets) ? user.savedPresets : [];
  res.json({ presets });
});

app.post('/save-preset', (req, res) => {
  const userId = getUserId(req, res);
  const { name, bodyState, physics } = req.body;
  if (!name || !bodyState || !physics) {
    return res.status(400).json({ error: 'Missing preset name or data.' });
  }
  const data = loadData();
  const user = data.users[userId] || {};
  const savedPresets = Array.isArray(user.savedPresets) ? user.savedPresets : [];
  const existing = savedPresets.find(p => p.name === name);
  if (existing) {
    existing.bodyState = bodyState;
    existing.physics = physics;
    existing.updatedAt = Date.now();
  } else {
    savedPresets.push({ name, bodyState, physics, createdAt: Date.now() });
  }
  data.users[userId] = { ...user, savedPresets };
  saveData(data);
  res.json({ success: true });
});

app.get('/load-preset', (req, res) => {
  const userId = getUserId(req, res);
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ error: 'Missing preset name.' });
  }
  const data = loadData();
  const user = data.users[userId] || {};
  const preset = (user.savedPresets || []).find(p => p.name === name);
  if (!preset) {
    return res.status(404).json({ error: 'Preset not found.' });
  }
  res.json({ preset });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App backend running on http://localhost:${PORT}`);
});
