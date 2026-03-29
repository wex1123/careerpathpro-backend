const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [answerSchema],
    scores: {
      type: Map,
      of: Number,
      default: {},
    },
    topCareers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Career',
      },
    ],
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
