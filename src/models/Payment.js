const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['career_pack', 'mentor_session'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeChargeId: {
      type: String,
      default: '',
    },
    metadata: {
      mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
      careerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
      sessionDate: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
