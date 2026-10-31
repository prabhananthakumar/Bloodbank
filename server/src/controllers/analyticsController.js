import BloodInventory from '../models/BloodInventory.js';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import BloodCamp from '../models/BloodCamp.js';
import {
  BLOOD_GROUPS,
  isBloodCompatible,
  getCompatibleDonorsFor
} from '../utils/bloodCompatibility.js';

// @desc    Get system-wide overview analytics for dashboard
// @route   GET /api/analytics/dashboard
// @access  Public
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalHospitals = await User.countDocuments({ role: 'hospital' });
    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'Pending' });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'Fulfilled' });
    const upcomingCamps = await BloodCamp.countDocuments({ status: 'Upcoming' });

    // Stock totals
    const availableUnits = await BloodInventory.countDocuments({
      status: 'available',
      expiryDate: { $gt: new Date() }
    });

    const quarantineUnits = await BloodInventory.countDocuments({ status: 'quarantine' });

    // Stock by blood group
    const groupStock = await BloodInventory.aggregate([
      {
        $match: {
          status: 'available',
          expiryDate: { $gt: new Date() }
        }
      },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]);

    const inventoryMap = {};
    BLOOD_GROUPS.forEach(bg => { inventoryMap[bg] = 0; });
    groupStock.forEach(item => {
      inventoryMap[item._id] = item.count;
    });

    // Determine critical shortages (groups with < 5 units)
    const criticalShortages = BLOOD_GROUPS.filter(bg => inventoryMap[bg] < 5);

    // Units expiring within 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const expiringSoon = await BloodInventory.countDocuments({
      status: 'available',
      expiryDate: { $gte: new Date(), $lte: nextWeek }
    });

    res.json({
      success: true,
      data: {
        stats: {
          availableUnits,
          quarantineUnits,
          totalDonors,
          totalHospitals,
          totalRequests,
          pendingRequests,
          fulfilledRequests,
          upcomingCamps,
          expiringSoon
        },
        inventoryMap,
        criticalShortages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Interactive Blood Group Compatibility Check
// @route   POST /api/analytics/check-compatibility
// @access  Public
export const checkCompatibility = async (req, res) => {
  const { donorGroup, recipientGroup, component } = req.body;

  if (!recipientGroup) {
    return res.status(400).json({ success: false, message: 'Recipient blood group is required' });
  }

  const compatibleDonors = getCompatibleDonorsFor(
    recipientGroup,
    component || 'Packed Red Blood Cells (PRBC)'
  );

  let compatible = null;
  if (donorGroup) {
    compatible = isBloodCompatible(donorGroup, recipientGroup, component);
  }

  res.json({
    success: true,
    data: {
      recipientGroup,
      donorGroup,
      component: component || 'Packed Red Blood Cells (PRBC)',
      isCompatible: compatible,
      compatibleDonorGroups: compatibleDonors
    }
  });
};
