import BloodCamp from '../models/BloodCamp.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all blood donation camps
// @route   GET /api/camps
// @access  Public
export const getAllCamps = async (req, res, next) => {
  try {
    const { city, status } = req.query;
    const filter = {};

    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (status) filter.status = status;

    const camps = await BloodCamp.find(filter).sort({ date: 1 });

    res.json({
      success: true,
      count: camps.length,
      data: camps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single camp
// @route   GET /api/camps/:id
// @access  Public
export const getCampById = async (req, res, next) => {
  try {
    const camp = await BloodCamp.findById(req.params.id);
    if (!camp) {
      return res.status(404).json({ success: false, message: 'Camp not found' });
    }
    res.json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new blood donation camp
// @route   POST /api/camps
// @access  Private (Admin)
export const createCamp = async (req, res, next) => {
  try {
    const {
      title,
      organizer,
      venue,
      address,
      date,
      startTime,
      endTime,
      targetUnits,
      contactPhone,
      contactEmail,
      description
    } = req.body;

    const camp = await BloodCamp.create({
      title,
      organizer,
      venue,
      address,
      date: new Date(date),
      startTime,
      endTime,
      targetUnits: targetUnits || 100,
      contactPhone,
      contactEmail,
      description
    });

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'CREATE_BLOOD_CAMP',
      entityType: 'BloodCamp',
      entityId: camp._id.toString(),
      details: { title, venue, date }
    });

    res.status(201).json({
      success: true,
      message: 'Blood donation camp successfully published',
      data: camp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update camp status
// @route   PUT /api/camps/:id
// @access  Private (Admin)
export const updateCamp = async (req, res, next) => {
  try {
    const camp = await BloodCamp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!camp) {
      return res.status(404).json({ success: false, message: 'Camp not found' });
    }
    res.json({ success: true, message: 'Camp updated', data: camp });
  } catch (error) {
    next(error);
  }
};
