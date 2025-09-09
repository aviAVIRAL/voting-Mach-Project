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
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded;
    next();
  });
};

// Add candidate
router.post('/candidate', verifyToken, async (req, res) => {
  try {
    const candidate = new Candidate({ name: req.body.name });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update candidate
router.put('/candidate/:id', verifyToken, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete candidate
router.delete('/candidate/:id', verifyToken, async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get live results
router.get('/results', verifyToken, async (req, res) => {
  try {
    const candidates = await Candidate.find({}, 'name votes');
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
