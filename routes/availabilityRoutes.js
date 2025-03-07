const express = require('express');
const { createAvailability, getAvailabilities } = require('../controllers/availabilityController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth('professor'), createAvailability);
router.get('/:professorId', getAvailabilities);

module.exports = router;