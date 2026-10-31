import BloodRequest from '../models/BloodRequest.js';
import BloodInventory from '../models/BloodInventory.js';
import AuditLog from '../models/AuditLog.js';
import { getCompatibleDonorsFor } from '../utils/bloodCompatibility.js';

// @desc    Create a blood requisition request
// @route   POST /api/requests
// @access  Private (Recipient, Hospital, Admin)
export const createRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      hospitalName,
      doctorName,
      bloodGroup,
      component,
      unitsRequired,
      urgency,
      clinicalDiagnosis,
      deliveryAddress
    } = req.body;

    const reqId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const request = await BloodRequest.create({
      requestId: reqId,
      requester: req.user._id,
      patientName,
      patientAge,
      patientGender,
      hospitalName,
      doctorName,
      bloodGroup,
      component: component || 'Packed Red Blood Cells (PRBC)',
      unitsRequired: unitsRequired || 1,
      urgency: urgency || 'Normal',
      clinicalDiagnosis,
      deliveryAddress
    });

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'CREATE_BLOOD_REQUEST',
      entityType: 'BloodRequest',
      entityId: request._id.toString(),
      details: { requestId: reqId, bloodGroup, unitsRequired, urgency }
    });

    res.status(201).json({
      success: true,
      message: 'Blood request registered successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own requests
// @route   GET /api/requests/my
// @access  Private
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user._id })
      .populate('allocatedBags', 'bagBarcode bloodGroup component expiryDate')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests (Admin/Staff)
// @route   GET /api/requests
// @access  Private (Admin/Staff)
export const getAllRequests = async (req, res, next) => {
  try {
    const { status, urgency, bloodGroup } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name email phone role hospitalDetails')
      .populate('allocatedBags', 'bagBarcode bloodGroup component storageLocation')
      .sort({ urgency: -1, createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review and approve/reject blood request
// @route   PUT /api/requests/:id/review
// @access  Private (Admin/Staff)
export const reviewRequest = async (req, res, next) => {
  try {
    const { status, adminRemarks, autoAllocate } = req.body;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (status === 'Approved' && autoAllocate) {
      // Find compatible blood groups for this recipient and component
      const compatibleGroups = getCompatibleDonorsFor(request.bloodGroup, request.component);

      // Find available bags
      const availableBags = await BloodInventory.find({
        bloodGroup: { $in: compatibleGroups },
        component: request.component,
        status: 'available',
        expiryDate: { $gt: new Date() }
      })
        .sort({ expiryDate: 1 }) // First-expiry, first-out (FIFO) principle
        .limit(request.unitsRequired);

      if (availableBags.length < request.unitsRequired) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory. Required ${request.unitsRequired} units, but only ${availableBags.length} compatible units are currently available.`
        });
      }

      // Mark bags as reserved
      const bagIds = availableBags.map(b => b._id);
      await BloodInventory.updateMany(
        { _id: { $in: bagIds } },
        { status: 'reserved', allocatedToRequest: request._id }
      );

      request.allocatedBags = bagIds;
    }

    request.status = status;
    request.adminRemarks = adminRemarks || request.adminRemarks;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    const updated = await request.save();

    await AuditLog.create({
      performedBy: req.user._id,
      action: `REVIEW_REQUEST_${status.toUpperCase()}`,
      entityType: 'BloodRequest',
      entityId: request._id.toString(),
      details: { status, allocatedCount: request.allocatedBags.length }
    });

    res.json({
      success: true,
      message: `Request marked as ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch blood request (finalize fulfillment)
// @route   POST /api/requests/:id/dispatch
// @access  Private (Admin/Staff)
export const dispatchRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved requests with allocated bags can be dispatched.'
      });
    }

    // Mark allocated bags as dispatched
    await BloodInventory.updateMany(
      { _id: { $in: request.allocatedBags } },
      { status: 'dispatched' }
    );

    request.status = 'Fulfilled';
    const updated = await request.save();

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'DISPATCH_BLOOD_REQUEST',
      entityType: 'BloodRequest',
      entityId: request._id.toString(),
      details: { bagsDispatched: request.allocatedBags.length }
    });

    res.json({
      success: true,
      message: 'Blood units successfully dispatched and requisition fulfilled.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
