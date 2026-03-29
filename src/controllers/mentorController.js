const Mentor = require('../models/Mentor');

const MENTOR_ALLOWED_FIELDS = [
  'expertise', 'careerFields', 'yearsOfExperience', 'sessionRate', 'availability',
];

const pickFields = (obj, fields) =>
  fields.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

// @desc    Get all active mentors (with optional filter)
// @route   GET /api/mentors
// @access  Public
const getMentors = async (req, res) => {
  const { field, page = 1, limit = 20 } = req.query;

  const filter = { isActive: true };
  if (field) filter.careerFields = field;

  const skip = (Number(page) - 1) * Number(limit);

  const [mentors, total] = await Promise.all([
    Mentor.find(filter)
      .populate('user', 'name email profilePicture bio')
      .skip(skip)
      .limit(Number(limit))
      .sort('-rating'),
    Mentor.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    mentors,
  });
};

// @desc    Get single mentor profile
// @route   GET /api/mentors/:id
// @access  Public
const getMentor = async (req, res) => {
  const mentor = await Mentor.findById(req.params.id).populate(
    'user',
    'name email profilePicture bio'
  );
  if (!mentor) {
    return res.status(404).json({ success: false, message: 'Mentor not found' });
  }
  res.json({ success: true, mentor });
};

// @desc    Create mentor profile for the logged-in user
// @route   POST /api/mentors
// @access  Private (mentor/admin role)
const createMentorProfile = async (req, res) => {
  const existing = await Mentor.findOne({ user: req.user.id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Mentor profile already exists' });
  }

  const mentor = await Mentor.create({ ...pickFields(req.body, MENTOR_ALLOWED_FIELDS), user: req.user.id });
  res.status(201).json({ success: true, mentor });
};

// @desc    Update mentor profile for the logged-in user
// @route   PUT /api/mentors/me
// @access  Private (mentor role)
const updateMentorProfile = async (req, res) => {
  const mentor = await Mentor.findOneAndUpdate({ user: req.user.id }, pickFields(req.body, MENTOR_ALLOWED_FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!mentor) {
    return res.status(404).json({ success: false, message: 'Mentor profile not found' });
  }
  res.json({ success: true, mentor });
};

module.exports = { getMentors, getMentor, createMentorProfile, updateMentorProfile };
