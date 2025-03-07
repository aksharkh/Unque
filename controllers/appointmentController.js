const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const mongoose = require('mongoose');

const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { availabilityId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
      await session.abortTransaction();
      return res.status(400).json({ msg: 'Invalid availability ID' });
    }

    const availability = await Availability.findById(availabilityId).session(session);
    if (!availability || !availability.isAvailable) {
      await session.abortTransaction();
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
    res.status(201).json(appointment); // ✅ Fixed: Return 201
  } catch (err) {
    await session.abortTransaction();
    console.error('Error in createAppointment:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  } finally {
    session.endSession();
  }
};

const cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('availability')
      .session(session);

    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    if (appointment.availability.professor.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    await Appointment.findByIdAndDelete(req.params.id).session(session);
    appointment.availability.isAvailable = true;
    await appointment.availability.save({ session });

    await session.commitTransaction();
    res.json({ msg: 'Appointment cancelled' });
  } catch (err) {
    await session.abortTransaction();
    console.error('Error in cancelAppointment:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  } finally {
    session.endSession();
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user.id }).populate('professor availability');
    res.json(appointments);
  } catch (err) {
    console.error('Error in getAppointments:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { createAppointment, cancelAppointment, getAppointments };
