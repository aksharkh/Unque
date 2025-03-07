const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Availability', availabilitySchema);