const express = require('express');
const { body } = require('express-validator');
const {
  createPaymentIntent,
  getMyPayments,
  stripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Stripe webhook must receive raw body (mounted before express.json in app.js)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.use(protect);

router.post(
  '/create-intent',
  [
    body('type')
      .isIn(['career_pack', 'mentor_session'])
      .withMessage('Type must be career_pack or mentor_session'),
    body('mentorId')
      .if(body('type').equals('mentor_session'))
      .notEmpty()
      .withMessage('mentorId is required for mentor_session')
      .isMongoId()
      .withMessage('mentorId must be a valid MongoDB ObjectId'),
    body('careerId')
      .if(body('type').equals('career_pack'))
      .notEmpty()
      .withMessage('careerId is required for career_pack')
      .isMongoId()
      .withMessage('careerId must be a valid MongoDB ObjectId'),
  ],
  validate,
  createPaymentIntent
);

router.get('/', getMyPayments);

module.exports = router;
