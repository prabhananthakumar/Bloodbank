import DonationAppointment from '../models/DonationAppointment.js';
import BloodInventory from '../models/BloodInventory.js';
import User from '../models/User.js';
import BloodCamp from '../models/BloodCamp.js';
import AuditLog from '../models/AuditLog.js';
import { COMPONENT_SHELF_LIFE_DAYS } from '../utils/bloodCompatibility.js';

// @desc    Book a donation appointment
// @route   POST /api/donations/book
// @access  Private (Donor, Admin)
export const bookAppointment = async (req, res, next) => {
  try {
    const { scheduledDate, timeSlot, bloodCamp, donationCenter, notes } = req.body;
    const donorId = req.user.role === 'admin' && req.body.donorId ? req.body.donorId : req.user._id;

    const donorUser = await User.findById(donorId);
    if (!donorUser) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Eligibility check: Last donation date should be at least 56 days (8 weeks) ago
    if (donorUser.donorProfile?.lastDonationDate) {
      const daysSinceLast = Math.floor(
        (new Date() - new Date(donorUser.donorProfile.lastDonationDate)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLast < 56) {
        return res.status(400).json({
          success: false,
          message: `Eligibility Notice: You donated ${daysSinceLast} days ago. Mandatory recovery interval is 56 days. Please schedule after ${56 - daysSinceLast} days.`
        });
      }
    }

    const appCode = `APT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const appointment = await DonationAppointment.create({
      appointmentCode: appCode,
      donor: donorId,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      bloodCamp: bloodCamp || null,
      donationCenter: donationCenter || 'Central Blood Bank & Transfusion Center',
      notes
    });

    if (bloodCamp) {
      await BloodCamp.findByIdAndUpdate(bloodCamp, { $inc: { registeredDonorsCount: 1 } });
    }

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'BOOK_DONATION_APPOINTMENT',
      entityType: 'DonationAppointment',
      entityId: appointment._id.toString(),
      details: { appointmentCode: appCode, scheduledDate }
    });

    res.status(201).json({
      success: true,
      message: 'Donation appointment successfully scheduled',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor's own appointments
// @route   GET /api/donations/my
// @access  Private
export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await DonationAppointment.find({ donor: req.user._id })
      .populate('bloodCamp', 'title venue city date')
      .populate('collectedBag', 'bagBarcode bloodGroup component status')
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (Staff/Admin)
// @route   GET /api/donations
// @access  Private (Admin/Staff)
export const getAllAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await DonationAppointment.find(filter)
      .populate('donor', 'name email phone bloodGroup donorProfile')
      .populate('bloodCamp', 'title venue')
      .populate('collectedBag')
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process donor screening vitals & collect blood unit
// @route   POST /api/donations/:id/process
// @access  Private (Admin/Staff)
export const processDonation = async (req, res, next) => {
  try {
    const {
      weightKg,
      hemoglobinGdl,
      systolicBp,
      diastolicBp,
      pulseBpm,
      temperatureF,
      isPassed,
      deferralReason,
      component,
      volumeMl,
      notes
    } = req.body;

    const appointment = await DonationAppointment.findById(req.params.id).populate('donor');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.vitalsCheck = {
      weightKg,
      hemoglobinGdl,
      systolicBp,
      diastolicBp,
      pulseBpm,
      temperatureF,
      isPassed: Boolean(isPassed),
      deferralReason: deferralReason || ''
    };
    appointment.staffAttendant = req.user._id;
    appointment.notes = notes || appointment.notes;

    if (!isPassed) {
      appointment.status = 'Deferred';
      await appointment.save();
      return res.json({
        success: true,
        message: 'Donor has been deferred based on clinical screening vitals',
        data: appointment
      });
    }

    // Donor passed screening: Create blood unit in quarantine
    const donorGroup = appointment.donor.bloodGroup !== 'Unknown' ? appointment.donor.bloodGroup : 'O+';
    const chosenComponent = component || 'Packed Red Blood Cells (PRBC)';
    const barcode = `BAG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const shelfDays = COMPONENT_SHELF_LIFE_DAYS[chosenComponent] || 42;
    const colDate = new Date();
    const expDate = new Date(colDate);
    expDate.setDate(expDate.getDate() + shelfDays);

    const newUnit = await BloodInventory.create({
      bagBarcode: barcode,
      bloodGroup: donorGroup,
      component: chosenComponent,
      volumeMl: volumeMl || 450,
      collectionDate: colDate,
      expiryDate: expDate,
      donor: appointment.donor._id,
      bloodCamp: appointment.bloodCamp || null,
      status: 'quarantine',
      testingStatus: 'pending',
      notes: `Collected during appointment ${appointment.appointmentCode}`
    });

    appointment.status = 'Completed';
    appointment.collectedBag = newUnit._id;
    await appointment.save();

    // Update Donor profile
    await User.findByIdAndUpdate(appointment.donor._id, {
      $set: {
        'donorProfile.lastDonationDate': new Date(),
        'donorProfile.weightKg': weightKg,
        'donorProfile.hemoglobin': hemoglobinGdl
      },
      $inc: { 'donorProfile.totalDonations': 1 }
    });

    // Update Camp collected count if applicable
    if (appointment.bloodCamp) {
      await BloodCamp.findByIdAndUpdate(appointment.bloodCamp, { $inc: { collectedUnits: 1 } });
    }

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'COLLECT_BLOOD_DONATION',
      entityType: 'DonationAppointment',
      entityId: appointment._id.toString(),
      details: { bagBarcode: barcode, bloodGroup: donorGroup }
    });

    res.json({
      success: true,
      message: 'Blood collected successfully! Bag registered in quarantine pending serology.',
      data: {
        appointment,
        unit: newUnit
      }
    });
  } catch (error) {
    next(error);
  }
};
