import mongoose from 'mongoose';

const donationAppointmentSchema = new mongoose.Schema(
  {
    appointmentCode: {
      type: String,
      unique: true,
      required: true
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    bloodCamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodCamp'
    },
    donationCenter: {
      type: String,
      default: 'Central Blood Bank & Transfusion Center'
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Deferred', 'No-Show'],
      default: 'Scheduled'
    },
    vitalsCheck: {
      weightKg: Number,
      hemoglobinGdl: Number,
      systolicBp: Number,
      diastolicBp: Number,
      pulseBpm: Number,
      temperatureF: Number,
      isPassed: Boolean,
      deferralReason: String
    },
    collectedBag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory'
    },
    staffAttendant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },
  {
    timestamps: true
  }
);

donationAppointmentSchema.index({ donor: 1, scheduledDate: -1 });

const DonationAppointment = mongoose.model('DonationAppointment', donationAppointmentSchema);
export default DonationAppointment;
