const express = require('express');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(400).json({ error: 'Invalid token' });
    }
}

// Get All Events
router.get('/', async (req, res) => {
    const events = await Event.find();
    res.json(events);
});

// Get Single Event
router.get('/:id', async (req, res) => {
    const event = await Event.findById(req.params.id);
    res.json(event);
});

// Create Event
router.post('/', authMiddleware, async (req, res) => {
    const newEvent = await Event.create({ ...req.body, createdBy: req.user.id });
    res.json(newEvent);
});

// Update Event
router.put('/:id', authMiddleware, async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (event.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

// Delete Event
router.delete('/:id', authMiddleware, async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (event.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    await event.delete();
    res.json({ message: 'Event deleted' });
});

module.exports = router;
