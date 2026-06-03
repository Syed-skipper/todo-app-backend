const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyMember', FamilyMemberSchema);
