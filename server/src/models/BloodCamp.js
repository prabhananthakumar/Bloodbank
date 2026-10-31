import mongoose from 'mongoose';

const bloodCampSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    organizer: {
      type: String,
      required: true
    },
    venue: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      pincode: String
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      default: '09:00 AM'
    },
    endTime: {
      type: String,
      default: '05:00 PM'
    },
    targetUnits: {
      type: Number,
      default: 100
    },
    collectedUnits: {
      type: Number,
      default: 0
    },
    registeredDonorsCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming'
    },
    contactPhone: String,
    contactEmail: String,
    description: String
  },
  {
    timestamps: true
  }
);

const BloodCamp = mongoose.model('BloodCamp', bloodCampSchema);
export default BloodCamp;
