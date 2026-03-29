const Career = require('../models/Career');

const CAREER_ALLOWED_FIELDS = [
  'title', 'description', 'category', 'skills',
  'averageSalary', 'demandLevel', 'roadmap', 'tags',
];

const pickFields = (obj, fields) =>
  fields.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

// @desc    Get all careers (with optional search/filter)
// @route   GET /api/careers
// @access  Public
const getCareers = async (req, res) => {
  const { search, category, demand, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (demand) filter.demandLevel = demand;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [careers, total] = await Promise.all([
    Career.find(filter).skip(skip).limit(Number(limit)).sort('-createdAt'),
    Career.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    careers,
  });
};

// @desc    Get single career + 12-month roadmap
// @route   GET /api/careers/:id
// @access  Public
const getCareer = async (req, res) => {
  const career = await Career.findById(req.params.id);
  if (!career) {
    return res.status(404).json({ success: false, message: 'Career not found' });
  }
  res.json({ success: true, career });
};

// @desc    Create a career (admin only)
// @route   POST /api/careers
// @access  Private/Admin
const createCareer = async (req, res) => {
  const career = await Career.create(pickFields(req.body, CAREER_ALLOWED_FIELDS));
  res.status(201).json({ success: true, career });
};

// @desc    Update a career (admin only)
// @route   PUT /api/careers/:id
// @access  Private/Admin
const updateCareer = async (req, res) => {
  const career = await Career.findByIdAndUpdate(req.params.id, pickFields(req.body, CAREER_ALLOWED_FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!career) {
    return res.status(404).json({ success: false, message: 'Career not found' });
  }
  res.json({ success: true, career });
};

// @desc    Delete a career (admin only)
// @route   DELETE /api/careers/:id
// @access  Private/Admin
const deleteCareer = async (req, res) => {
  const career = await Career.findByIdAndDelete(req.params.id);
  if (!career) {
    return res.status(404).json({ success: false, message: 'Career not found' });
  }
  res.json({ success: true, message: 'Career deleted' });
};

module.exports = { getCareers, getCareer, createCareer, updateCareer, deleteCareer };
