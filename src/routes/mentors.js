const express = require('express');
const { body } = require('express-validator');
const {
  getMentors,
  getMentor,
  createMentorProfile,
  updateMentorProfile,
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', getMentors);
router.get('/:id', getMentor);

router.post(
  '/',
  protect,
  authorize('mentor', 'admin'),
  [
    body('expertise')
      .isArray({ min: 1 })
      .withMessage('At least one expertise area is required')
      .custom((arr) => arr.every((item) => typeof item === 'string' && item.trim().length > 0))
      .withMessage('Each expertise item must be a non-empty string'),
    body('yearsOfExperience')
      .isInt({ min: 0 })
      .withMessage('Years of experience must be a non-negative integer'),
    body('sessionRate')
      .isFloat({ min: 0 })
      .withMessage('Session rate must be a non-negative number'),
  ],
  validate,
  createMentorProfile
);

router.put('/me', protect, authorize('mentor', 'admin'), updateMentorProfile);

module.exports = router;
