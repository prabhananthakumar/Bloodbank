import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      required: true
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required']
    },
    patientAge: {
      type: Number,
      required: [true, 'Patient age is required']
    },
    patientGender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required']
    },
    doctorName: {
      type: String
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    component: {
      type: String,
      enum: [
        'Whole Blood',
        'Packed Red Blood Cells (PRBC)',
        'Fresh Frozen Plasma (FFP)',
        'Platelets',
        'Cryoprecipitate'
      ],
      default: 'Packed Red Blood Cells (PRBC)'
    },
    unitsRequired: {
      type: Number,
      required: true,
      min: [1, 'Must request at least 1 unit'],
      max: [20, 'For bulk orders over 20 units, contact direct medical command']
    },
    urgency: {
      type: String,
      enum: ['Normal', 'High', 'Critical/Emergency'],
      default: 'Normal'
    },
    clinicalDiagnosis: {
      type: String,
      required: [true, 'Clinical diagnosis/reason is required']
    },
    deliveryAddress: {
      street: String,
      city: String,
      pincode: String,
      contactPerson: String,
      contactPhone: String
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled'],
      default: 'Pending'
    },
    allocatedBags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodInventory'
      }
    ],
    adminRemarks: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  {
    timestamps: true
  }
);

bloodRequestSchema.index({ status: 1, urgency: 1, createdAt: -1 });

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
