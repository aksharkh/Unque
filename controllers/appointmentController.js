const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const mongoose = require('mongoose');

const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { availabilityId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
      return res.status(400).json({ msg: 'Invalid availability ID' });
    }

    const availability = await Availability.findById(availabilityId).session(session);
    if (!availability || !availability.isAvailable) {
      return res.status(400).json({ msg: 'Slot not available' });
    }

    const appointment = new Appointment({
      student: req.user.id,
      professor: availability.professor,
      availability: availabilityId
    });

    await appointment.save({ session });
    availability.isAvailable = false;
    await availability.save({ session });

    await session.commitTransaction();
    res.status(201).json(appointment);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ msg: 'Server error', error: err.message });
  } finally {
    session.endSession();
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('availability');
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    if (appointment.availability.professor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    appointment.availability.isAvailable = true;
    await appointment.availability.save();

    res.json({ msg: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user.id })
      .populate('professor availability');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { createAppointment, cancelAppointment, getAppointments };
