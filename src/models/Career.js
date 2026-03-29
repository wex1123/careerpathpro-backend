const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    resources: [{ type: String }],
  },
  { _id: false }
);

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Career title is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    skills: [{ type: String }],
    averageSalary: {
      type: Number,
    },
    demandLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    roadmap: [roadmapStepSchema],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

careerSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model('Career', careerSchema);
