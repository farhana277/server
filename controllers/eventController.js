const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

// Middleware to protect routes and check for valid token
const authMiddleware = require('../middleware/authMiddleware');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  const { title, date, time, location, description, category } = req.body;

  if (!title || !date || !time || !location || !description || !category) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    const newEvent = new Event({
      title,
      date,
      time,
      location,
      description,
      category,
      createdBy: req.user.id,
    });

    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing event
exports.updateEvent = async (req, res) => {
  const { title, date, time, location, description, category } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the current user is the one who created the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    event.title = title || event.title;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.description = description || event.description;
    event.category = category || event.category;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the current user is the one who created the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await event.remove();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
