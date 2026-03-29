const express = require('express');
const { body } = require('express-validator');
const {
  getCareers,
  getCareer,
  createCareer,
  updateCareer,
  deleteCareer,
} = require('../controllers/careerController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', getCareers);
router.get('/:id', getCareer);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  validate,
  createCareer
);

router.put('/:id', protect, authorize('admin'), updateCareer);
router.delete('/:id', protect, authorize('admin'), deleteCareer);

module.exports = router;
