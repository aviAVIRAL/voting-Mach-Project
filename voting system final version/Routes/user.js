const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    if (decoded.role !== 'user') return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded;
    next();
  });
};

// Get all candidates
router.get('/candidates', verifyToken, async (req, res) => {
  try {
    const candidates = await Candidate.find({}, 'name votes');
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vote
router.post('/vote', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.hasVoted) return res.status(400).json({ message: 'User already voted' });

    const candidate = await Candidate.findById(req.body.candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    candidate.votes += 1;
    await candidate.save();

    user.hasVoted = true;
    await user.save();

    res.json({ message: 'Vote cast successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
