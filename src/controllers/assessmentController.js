const Assessment = require('../models/Assessment');
const Career = require('../models/Career');

// Simple scoring: count how often each career category appears in answers
const computeTopCareers = async (answers) => {
  const scores = {};
  answers.forEach(({ answer }) => {
    if (typeof answer === 'string') {
      scores[answer] = (scores[answer] || 0) + 1;
    }
  });

  // Find careers whose category or tags match top-scored categories
  const topCategories = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  const careers = await Career.find({
    $or: [
      { category: { $in: topCategories } },
      { tags: { $in: topCategories } },
    ],
  }).limit(5);

  return { scores, topCareers: careers.map((c) => c._id) };
};

// @desc    Start or update an assessment
// @route   POST /api/assessments
// @access  Private
const submitAssessment = async (req, res) => {
  const { answers } = req.body;

  const { scores, topCareers } = await computeTopCareers(answers);

  // Find any in-progress assessment for this user, update it, or create a new one
  let assessment = await Assessment.findOne({ user: req.user.id, status: 'in_progress' });
  if (assessment) {
    assessment.answers = answers;
    assessment.scores = scores;
    assessment.topCareers = topCareers;
    assessment.status = 'completed';
    assessment.completedAt = new Date();
    await assessment.save();
  } else {
    assessment = await Assessment.create({
      user: req.user.id,
      answers,
      scores,
      topCareers,
      status: 'completed',
      completedAt: new Date(),
    });
  }

  await assessment.populate('topCareers');

  res.status(201).json({ success: true, assessment });
};

// @desc    Get all assessments for current user
// @route   GET /api/assessments
// @access  Private
const getMyAssessments = async (req, res) => {
  const assessments = await Assessment.find({ user: req.user.id })
    .populate('topCareers')
    .sort('-createdAt');
  res.json({ success: true, count: assessments.length, assessments });
};

// @desc    Get a single assessment
// @route   GET /api/assessments/:id
// @access  Private
const getAssessment = async (req, res) => {
  const assessment = await Assessment.findOne({
    _id: req.params.id,
    user: req.user.id,
  }).populate('topCareers');

  if (!assessment) {
    return res.status(404).json({ success: false, message: 'Assessment not found' });
  }

  res.json({ success: true, assessment });
};

module.exports = { submitAssessment, getMyAssessments, getAssessment };
