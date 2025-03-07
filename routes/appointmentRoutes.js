const express = require('express');
const { createAppointment, cancelAppointment, getAppointments } = require('../controllers/appointmentController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth('student'), createAppointment);
router.delete('/:id', auth('professor'), cancelAppointment);
router.get('/', auth('student'), getAppointments);

module.exports = router;