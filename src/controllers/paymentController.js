const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Mentor = require('../models/Mentor');
const Career = require('../models/Career');
const User = require('../models/User');

// @desc    Create a Stripe PaymentIntent for a career pack or mentor session
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  const { type, mentorId, careerId, sessionDate } = req.body;

  let amount;
  const metadata = {};

  if (type === 'mentor_session') {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }
    amount = Math.round(mentor.sessionRate * 100); // cents
    metadata.mentorId = mentorId;
    if (sessionDate) metadata.sessionDate = new Date(sessionDate);
  } else if (type === 'career_pack') {
    const career = await Career.findById(careerId);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }
    amount = 2999; // $29.99 flat rate for a career pack
    metadata.careerId = careerId;
  } else {
    return res.status(400).json({ success: false, message: 'Invalid payment type' });
  }

  // Ensure Stripe customer exists
  let customerId = req.user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
    });
    customerId = customer.id;
    await User.findByIdAndUpdate(req.user.id, { stripeCustomerId: customerId });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customerId,
    metadata: { userId: String(req.user.id), type },
  });

  const payment = await Payment.create({
    user: req.user.id,
    type,
    amount: amount / 100,
    stripePaymentIntentId: paymentIntent.id,
    metadata,
  });

  res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentId: payment._id,
  });
};

// @desc    Get payment history for current user
// @route   GET /api/payments
// @access  Private
const getMyPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user.id }).sort('-createdAt');
  res.json({ success: true, count: payments.length, payments });
};

// @desc    Stripe webhook – update payment status
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        { status: 'succeeded', stripeChargeId: pi.latest_charge || '' }
      );
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      await Payment.findOneAndUpdate({ stripePaymentIntentId: pi.id }, { status: 'failed' });
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
};

module.exports = { createPaymentIntent, getMyPayments, stripeWebhook };
