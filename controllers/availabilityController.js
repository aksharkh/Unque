const Availability = require('../models/Availability');

const createAvailability = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const availability = await Availability.create({
      professor: req.user.id,
      startTime,
      endTime
    });
    res.json(availability);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const getAvailabilities = async (req, res) => {
  try {
    const availabilities = await Availability.find({
      professor: req.params.professorId,
      isAvailable: true
    });
    res.json(availabilities);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { createAvailability, getAvailabilities };
