import BloodInventory from '../models/BloodInventory.js';
import AuditLog from '../models/AuditLog.js';
import { BLOOD_GROUPS, COMPONENT_SHELF_LIFE_DAYS } from '../utils/bloodCompatibility.js';

// @desc    Get aggregated inventory summary by blood group & component
// @route   GET /api/inventory/summary
// @access  Public
export const getInventorySummary = async (req, res, next) => {
  try {
    // Automatically update expired units before returning summary
    await BloodInventory.updateMany(
      {
        expiryDate: { $lt: new Date() },
        status: { $in: ['available', 'quarantine', 'reserved'] }
      },
      { status: 'expired' }
    );

    const summary = await BloodInventory.aggregate([
      {
        $match: { status: 'available' }
      },
      {
        $group: {
          _id: {
            bloodGroup: '$bloodGroup',
            component: '$component'
          },
          totalUnits: { $sum: 1 },
          totalVolumeMl: { $sum: '$volumeMl' }
        }
      },
      {
        $project: {
          _id: 0,
          bloodGroup: '$_id.bloodGroup',
          component: '$_id.component',
          totalUnits: 1,
          totalVolumeMl: 1
        }
      }
    ]);

    // Compute summary by blood group overall
    const bloodGroupTotals = {};
    BLOOD_GROUPS.forEach(bg => { bloodGroupTotals[bg] = 0; });

    summary.forEach(item => {
      if (bloodGroupTotals[item.bloodGroup] !== undefined) {
        bloodGroupTotals[item.bloodGroup] += item.totalUnits;
      }
    });

    res.json({
      success: true,
      data: {
        detailed: summary,
        bloodGroupTotals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inventory units with filters
// @route   GET /api/inventory
// @access  Private (Admin/Staff)
export const getAllUnits = async (req, res, next) => {
  try {
    const { bloodGroup, component, status, search } = req.query;
    const query = {};

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (component) query.component = component;
    if (status) query.status = status;
    if (search) {
      query.bagBarcode = { $regex: search, $options: 'i' };
    }

    const units = await BloodInventory.find(query)
      .populate('donor', 'name email phone bloodGroup')
      .populate('bloodCamp', 'title venue')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: units.length,
      data: units
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a single blood bag into inventory
// @route   POST /api/inventory
// @access  Private (Admin/Staff)
export const addBloodUnit = async (req, res, next) => {
  try {
    const {
      bagBarcode,
      bloodGroup,
      component,
      volumeMl,
      collectionDate,
      storageLocation,
      donor,
      bloodCamp,
      notes
    } = req.body;

    const barcode = bagBarcode || `BAG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const days = COMPONENT_SHELF_LIFE_DAYS[component || 'Packed Red Blood Cells (PRBC)'] || 42;
    const colDate = collectionDate ? new Date(collectionDate) : new Date();
    const expDate = new Date(colDate);
    expDate.setDate(expDate.getDate() + days);

    const unit = await BloodInventory.create({
      bagBarcode: barcode,
      bloodGroup,
      component: component || 'Packed Red Blood Cells (PRBC)',
      volumeMl: volumeMl || 450,
      collectionDate: colDate,
      expiryDate: expDate,
      storageLocation,
      donor,
      bloodCamp,
      status: 'quarantine',
      testingStatus: 'pending',
      notes
    });

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'ADD_BLOOD_UNIT',
      entityType: 'BloodInventory',
      entityId: unit._id.toString(),
      details: { bagBarcode: barcode, bloodGroup, component }
    });

    res.status(201).json({
      success: true,
      message: 'Blood unit stored in quarantine pending laboratory testing',
      data: unit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update serology test results and verify unit
// @route   PUT /api/inventory/:id/testing
// @access  Private (Admin/Staff)
export const updateTestingStatus = async (req, res, next) => {
  try {
    const { serologyTestResults, testingStatus, notes } = req.body;
    const unit = await BloodInventory.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({ success: false, message: 'Blood bag not found' });
    }

    if (serologyTestResults) {
      unit.serologyTestResults = { ...unit.serologyTestResults, ...serologyTestResults };
    }

    if (testingStatus) {
      unit.testingStatus = testingStatus;
      if (testingStatus === 'passed') {
        unit.status = 'available';
      } else if (testingStatus === 'failed') {
        unit.status = 'discarded';
      }
    }

    if (notes) unit.notes = notes;

    const updatedUnit = await unit.save();

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'UPDATE_TESTING_STATUS',
      entityType: 'BloodInventory',
      entityId: unit._id.toString(),
      details: { status: unit.status, testingStatus: unit.testingStatus }
    });

    res.json({
      success: true,
      message: `Unit test updated. Current status: ${unit.status}`,
      data: updatedUnit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Discard or expire units
// @route   POST /api/inventory/purge-expired
// @access  Private (Admin)
export const discardExpiredUnits = async (req, res, next) => {
  try {
    const result = await BloodInventory.updateMany(
      {
        expiryDate: { $lt: new Date() },
        status: { $ne: 'discarded' }
      },
      { status: 'expired' }
    );

    res.json({
      success: true,
      message: `Checked and updated ${result.modifiedCount} expired units.`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};
