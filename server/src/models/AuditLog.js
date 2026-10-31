import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ['BloodInventory', 'BloodRequest', 'DonationAppointment', 'BloodCamp', 'User', 'System']
    },
    entityId: {
      type: String
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: String
  },
  {
    timestamps: true
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
