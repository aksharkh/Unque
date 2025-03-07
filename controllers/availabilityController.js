const Availability = require('../models/Availability');

const createAvailability = async (req, res) => {
  const { startTime, endTime } = req.body;
  try {
    const availability = new Availability({
      professor: req.user.id,
      startTime,
      endTime
    });
    await availability.save();
    res.json(availability);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const getAvailabilities = async (req, res) => {
  try {
    const availabilities = await Availability.find({ professor: req.params.professorId, isAvailable: true });
    res.json(availabilities);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

module.exports = { createAvailability, getAvailabilities };