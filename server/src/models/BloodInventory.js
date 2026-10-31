import mongoose from 'mongoose';
import { COMPONENT_SHELF_LIFE_DAYS } from '../utils/bloodCompatibility.js';

const bloodInventorySchema = new mongoose.Schema(
  {
    bagBarcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
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
    volumeMl: {
      type: Number,
      default: 450
    },
    collectionDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: true
    },
    storageLocation: {
      refrigeratorUnit: { type: String, default: 'Fridge-A1' },
      shelfNumber: { type: String, default: 'Shelf-2' },
      temperatureCelsius: { type: Number, default: 4.0 }
    },
    testingStatus: {
      type: String,
      enum: ['pending', 'passed', 'failed'],
      default: 'pending'
    },
    serologyTestResults: {
      hiv: { type: Boolean, default: false },
      hepatitisB: { type: Boolean, default: false },
      hepatitisC: { type: Boolean, default: false },
      syphilis: { type: Boolean, default: false },
      malaria: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: ['quarantine', 'available', 'reserved', 'dispatched', 'expired', 'discarded'],
      default: 'quarantine'
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bloodCamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodCamp'
    },
    allocatedToRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest'
    },
    notes: String
  },
  {
    timestamps: true
  }
);

// Auto-calculate expiryDate if not explicitly provided
bloodInventorySchema.pre('validate', function (next) {
  if (!this.expiryDate && this.collectionDate && this.component) {
    const days = COMPONENT_SHELF_LIFE_DAYS[this.component] || 42;
    const exp = new Date(this.collectionDate);
    exp.setDate(exp.getDate() + days);
    this.expiryDate = exp;
  }
  next();
});

// Indexes for high-performance stock queries
bloodInventorySchema.index({ bloodGroup: 1, component: 1, status: 1 });
bloodInventorySchema.index({ expiryDate: 1 });
bloodInventorySchema.index({ bagBarcode: 1 }, { unique: true });

const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);
export default BloodInventory;
