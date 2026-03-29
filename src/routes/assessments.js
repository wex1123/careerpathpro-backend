const express = require('express');
const { body } = require('express-validator');
const {
  submitAssessment,
  getMyAssessments,
  getAssessment,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('answers').isArray({ min: 1 }).withMessage('Answers must be a non-empty array'),
    body('answers.*.questionId').notEmpty().withMessage('Each answer needs a questionId'),
    body('answers.*.question').notEmpty().withMessage('Each answer needs the question text'),
    body('answers.*.answer').exists().withMessage('Each answer needs a value'),
  ],
  validate,
  submitAssessment
);

router.get('/', getMyAssessments);
router.get('/:id', getAssessment);

module.exports = router;
